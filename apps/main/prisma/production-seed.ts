import { PrismaClient } from '@prisma/client';

// This represents platform domains shared across all authorities
// (no reason to populate authority specifics)
interface PlatformDomain {
  name: string;
  children?: string[];
}

const platformDomains: PlatformDomain[] = [
  {
    name: 'Assurance, responsabilité civile',
  },
  {
    name: 'Marché public',
    children: ['Contrat', 'Achat'],
  },
  {
    name: 'Finances et tarifs',
  },
  {
    name: 'Fiscalité',
  },
  {
    name: 'RH (hors agent en fonction)',
  },
  {
    name: 'Accès aux archives',
  },
  {
    name: 'Vie associative',
  },
  {
    name: 'Lutte contre les exclusions',
  },
  {
    name: 'Prévention et gestion des risques',
  },
  {
    name: 'Santé',
  },
  {
    name: 'Sport et loisir',
  },
  {
    name: 'Éducation',
  },
  {
    name: 'Jeunesse',
  },
  {
    name: 'Enfance',
    children: ['Protection (ASE)', 'Mode de garde', 'Protection maternelle et infantile (PMI)'],
  },
  {
    name: 'Action sociale',
    children: ['Aide financière'],
  },
  {
    name: 'Habitat, Logement',
    children: ['FSL', 'Insalubrité, péril', 'Logement social', 'Gestion immobilière'],
  },
  {
    name: 'Facture impayée',
  },
  {
    name: 'Emploi, entreprise, insertion',
    children: ['Entreprise, ESS, Commerce et Artisanat', 'Formation', 'Financement des formations'],
  },
  {
    name: 'RSA',
  },
  {
    name: 'Handicap',
    children: ['Autonomie', 'MDPH'],
  },
  {
    name: 'Personne âgée',
  },
  {
    name: 'Propreté',
    children: ['Déchets, collecte et gestion'],
  },
  {
    name: 'Déplacement',
    children: [
      'Voirie',
      'Signalétique',
      'Circulation',
      'Mobilité durable',
      'Transport collectif',
      'Transport de marchandises',
      'Stationnement',
      'Fourrière',
    ],
  },
  {
    name: 'Urbanisme-Foncier',
    children: [
      'Bâtiment, local ou équipement',
      'Accessibilité',
      'Aménagement, impact des travaux',
      "Espace public : réglementation, contrôle, conflit d'usage",
      "Permis de construire, d'aménager, authorisation d'urbanisme, déclaration de travaux",
      'Cadre de vie, contestation de travaux',
      'Éclairage public',
      'Protection du patrimoine',
    ],
  },
  {
    name: 'Culture-Patrimoine',
  },
  {
    name: 'Sécurité, tranquillité',
    children: ['Problème de voisinage', 'Nuisance sonore', 'Incendie'],
  },
  {
    name: 'Eau et assainissement',
  },
  {
    name: 'Environnement',
    children: [
      'Patrimoine naturel, espace vert, végétation, arbres, biodiversité',
      'Plan de sauvegarde et de mise en valeur',
      'Entretien des espaces publics',
      'Agriculture',
    ],
  },
  {
    name: 'Autre service à la population',
    children: ['État civil', 'Service funéraire', 'Accès aux services publics', "Accès à l'information"],
  },
  {
    name: 'Numérique, Téléphonie',
    children: ['Lutte contre la fracture numérique', 'Infrastructure', 'Accès aux services publics'],
  },
  {
    name: 'Affaire internationale',
  },
  {
    name: 'Tourisme',
  },
  {
    name: 'Autre',
  },
];

// This represents platform competent third-parties shared across all authorities
// (no reason to populate authority specifics)
interface PlatformCompetentThirdParty {
  name: string;
  children?: string[];
}

const platformCompetentThirdParties: PlatformCompetentThirdParty[] = [
  {
    name: 'Médiateur institutionnel',
    children: [
      'Défenseur des droits',
      'Enseignement, formation',
      'Autre Collectivité',
      'CAF',
      'Retraite',
      'CPAM',
      'Médiateur URSSAF',
      'Médiateur UDAFF',
      'Pôle Emploi',
      'Communication postale ou électronique',
      'Entreprises',
      'Médiateur en Entreprise',
      'Médiateur Économique et financier',
      'Médiateur Énergie',
      'Médiateur Eau',
      'Banque, Assurance, Mutuelle',
      'Santé',
      'Transport',
      'Médiateur MSAP',
      'Médiateur CCI',
      'Médiateur DIRECCTE',
      'DGFIP Concilliateur fiscal',
      'Médiateur Fédération des banques françaises',
      'Médiateur Notariat',
      'Médiateur Consommation',
      'Conciliateur de justice',
      'Médiateur Familial',
      'Médiateur Médical',
      'Médiateur Social',
      'Médiateur Tourisme',
    ],
  },
  {
    name: 'Hors Médiateur',
    children: [
      'Bailleur',
      'Tribunal administratif',
      'Trésorerie',
      'Centre Hospitalier',
      'Centre de gestion',
      'Maison de la justice et du droit',
      'ADIL',
      'Collectivité ou groupement de collectivités sans médiateur',
      'Opérateur de téléphonie',
      'Tribunal',
      'Huissier de justice',
      'Mutuelle S.Agricole',
      'Transport',
      'ARCEP',
      'ARCOM',
      'ACNUSA',
      'Régulation de la concurrence',
      'Autre Autorité de régulation',
      'CNIL',
      'Préfecture',
      'Officier du ministère public',
      'Prudhomme',
    ],
  },
];

// Some data is known in advance but does not fit into ENUMs, they are dynamic so we need
// to define them through tables, the following code helps populating the database when
// setting up an environment
export async function seedProductionDataIntoDatabase(prismaClient: PrismaClient) {
  const domainsResults = await Promise.all(
    platformDomains.map(async (platformDomain) => {
      const result = await prismaClient.caseDomainItem.create({
        data: {
          authorityId: null, // Since platform domain
          name: platformDomain.name,
          childrenItems: platformDomain.children
            ? {
                create: platformDomain.children.map((childItemName) => {
                  return {
                    authorityId: null,
                    name: childItemName,
                  };
                }),
              }
            : undefined,
        },
      });

      return result;
    })
  );

  const competentThirdPartiesResults = await Promise.all(
    platformCompetentThirdParties.map(async (platformCompetentThirdParty) => {
      const result = await prismaClient.caseCompetentThirdPartyItem.create({
        data: {
          authorityId: null, // Since platform shared item
          name: platformCompetentThirdParty.name,
          childrenItems: platformCompetentThirdParty.children
            ? {
                create: platformCompetentThirdParty.children.map((childItemName) => {
                  return {
                    authorityId: null,
                    name: childItemName,
                  };
                }),
              }
            : undefined,
        },
      });

      return result;
    })
  );
}
