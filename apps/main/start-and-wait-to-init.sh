#!/bin/sh

#
# We trigger an init endpoint to set up all async processes like cron scheduling
# because unfortunately Next.js does not provide a proper way to use a startup callback
#

#
# Node.js 18 does not take the container memory quota into account to size its heap, so it can grow beyond it
# and the container gets killed (on Scalingo: "memory quota exceeded"). We cap the heap to a ratio of the container quota
# (not of the host memory), leaving room for the non-heap memory and the `npm`/`pnpm` wrapper processes
#

heap_ratio_percent=65

get_container_memory_limit_bytes() {
  if [ -r /sys/fs/cgroup/memory.max ]; then
    # cgroup v2 (value is "max" when unlimited)
    cat /sys/fs/cgroup/memory.max
  elif [ -r /sys/fs/cgroup/memory/memory.limit_in_bytes ]; then
    # cgroup v1 (value is a huge number when unlimited)
    cat /sys/fs/cgroup/memory/memory.limit_in_bytes
  fi
}

node_heap_options=""

case "$NODE_OPTIONS" in
  *--max-old-space-size*)
    echo "Using the heap limit from NODE_OPTIONS ($NODE_OPTIONS)"
    ;;
  *)
    memory_limit_bytes=$(get_container_memory_limit_bytes)

    # Only consider numeric values below 1TB, otherwise it means there is no real limit
    if echo "$memory_limit_bytes" | grep -Eq '^[0-9]{1,12}$'; then
      max_old_space_size_mb=$((memory_limit_bytes / 1024 / 1024 * heap_ratio_percent / 100))
      node_heap_options="--max-old-space-size=$max_old_space_size_mb"

      echo "Container memory limit detected ($((memory_limit_bytes / 1024 / 1024))MB), capping the Node.js heap to ${max_old_space_size_mb}MB (${heap_ratio_percent}%)"
    else
      echo "[WARNING] Unable to detect the container memory limit (value: \"${memory_limit_bytes:-not readable}\"), Node.js will use its default heap limit that may exceed the available memory. It's advised to define the environment variable NODE_OPTIONS=--max-old-space-size=<~${heap_ratio_percent}% of the container memory in MB> (for example 332 for 512MB)"
    fi
    ;;
esac

echo "Start the server in background"
node $node_heap_options ./dist/apps/main/server.js &

# Store the server process ID
next_pid=$!

stop_server() {
  echo "Shut down Next.js server..."
  kill $next_pid
  exit 0
}

# Bind the callback to the SIGINT signal to shut down the background process properly
trap stop_server INT

check_server_and_init() {
  timeout=15
  counter=0

  host="$HOSTNAME:$PORT"
  healthcheck_url="http://$host"

  while true; do
    response=$(curl --write-out %{http_code} --silent --output /dev/null "$healthcheck_url")
    if [ "$response" = "200" ] || [ "$response" = "301" ] || [ "$response" = "302" ] || [ "$response" = "307" ]; then # Looking for redirections since the root became another page
      break
    fi

    if [ $counter -eq $timeout ]; then
      echo "Error: the Next.js server is not ready within the expected timeframe"

      # Kill the server since it has no reason to continue
      kill $next_pid
      exit 1
    fi

    echo "the Next.js server is not yet ready on $healthcheck_url"

    sleep 1
    counter=$((counter+1))
  done

  curl http://$host/api/init
}

# In parallel wait for the server readiness to init some services
check_server_and_init

# Wait for the Next.js server to return
wait

echo "The wait instruction has exited normally"
