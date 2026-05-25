import { AuthProvider, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** Centrum Opoczna (Nominatim) */
const OPOCZNO = { lat: 51.3757, lng: 20.2863 };

const sellers = [
  {
    email: 'marek.nowak@freshmarket.seed',
    name: 'Marek Nowak',
    pins: [
      {
        title: 'Świeże jaja ekologiczne',
        description:
          'Jaja od kur chowanych na wolnym wybiegu, karmione zbożem z własnego gospodarstwa. Odbiór codziennie 8–18.',
        category: 'eggs',
        priceLabel: '1,50 zł/szt',
        latitude: OPOCZNO.lat + 0.004,
        longitude: OPOCZNO.lng + 0.003,
      },
    ],
  },
  {
    email: 'anna.kowalska@freshmarket.seed',
    name: 'Anna Kowalska',
    pins: [
      {
        title: 'Warzywa sezonowe z grządki',
        description: 'Marchew, pietruszka, seler, kapusta. Bez pestycydów, uprawa ekologiczna.',
        category: 'vegetables',
        priceLabel: 'od 4 zł/kg',
        latitude: OPOCZNO.lat - 0.003,
        longitude: OPOCZNO.lng - 0.005,
      },
      {
        title: 'Ziemniaki i cebula',
        description: 'Odmiany lokalne, przechowywane w piwnicy. Możliwość większych zamówień.',
        category: 'vegetables',
        priceLabel: '3 zł/kg',
        latitude: OPOCZNO.lat - 0.005,
        longitude: OPOCZNO.lng + 0.002,
      },
    ],
  },
  {
    email: 'tomasz.wisniewski@freshmarket.seed',
    name: 'Tomasz Wiśniewski',
    pins: [
      {
        title: 'Miód lipowy i wielokwiatowy',
        description: 'Pasieka w okolicy Opoczna. Miód filtrowany, słoiki 250 ml i 900 ml.',
        category: 'honey',
        priceLabel: '35 zł / 900 ml',
        latitude: OPOCZNO.lat + 0.006,
        longitude: OPOCZNO.lng - 0.004,
      },
    ],
  },
  {
    email: 'ewa.zielinska@freshmarket.seed',
    name: 'Ewa Zielińska',
    pins: [
      {
        title: 'Sery i jogurty z mleka krowiego',
        description: 'Twaróg, bundz, jogurt naturalny. Mleko od krów wypasanych regionalnie.',
        category: 'dairy',
        priceLabel: 'od 12 zł/kg',
        latitude: OPOCZNO.lat + 0.002,
        longitude: OPOCZNO.lng + 0.007,
      },
    ],
  },
  {
    email: 'karolina.wojcik@freshmarket.seed',
    name: 'Karolina Wójcik',
    pins: [
      {
        title: 'Jabłka i gruszki z sadu',
        description: 'Odmiany regionalne, doskonałe do przetworów. Zapraszam na samozbiór w weekendy.',
        category: 'fruits',
        priceLabel: '5 zł/kg',
        latitude: OPOCZNO.lat - 0.006,
        longitude: OPOCZNO.lng - 0.003,
      },
      {
        title: 'Maliny i truskawki (sezon)',
        description: 'Owoce sezonowe w ogródku pod Opocznem. Aktualna dostępność w wiadomości.',
        category: 'fruits',
        priceLabel: '18 zł/kg',
        latitude: OPOCZNO.lat - 0.002,
        longitude: OPOCZNO.lng + 0.006,
      },
    ],
  },
];

async function main() {
  console.log('🌱 Seed: przykładowe pinezki w Opocznie…');

  for (const seller of sellers) {
    const user = await prisma.user.upsert({
      where: { email: seller.email },
      update: { name: seller.name },
      create: {
        email: seller.email,
        name: seller.name,
        provider: AuthProvider.credentials,
      },
    });

    await prisma.pin.deleteMany({ where: { userId: user.id } });

    for (const pin of seller.pins) {
      await prisma.pin.create({
        data: {
          title: pin.title,
          description: pin.description,
          category: pin.category,
          latitude: pin.latitude,
          longitude: pin.longitude,
          priceLabel: pin.priceLabel,
          userId: user.id,
        },
      });
    }

    console.log(`  ✓ ${seller.name} — ${seller.pins.length} pinezek`);
  }

  const total = await prisma.pin.count();
  console.log(`\n✅ Gotowe. Łącznie ${total} pinezek w bazie.`);
  console.log('   Na mapie wyszukaj: Opoczno');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
