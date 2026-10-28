import { StageDef } from '../types/game';

export const STAGES: StageDef[] = [
  {
    id: 'aurrera',
    name: 'Bodega Aurrera',
    location: 'Pasillo 4: Despensa y Día de Muertos',
    description: 'El supermercado más querido de México. Con letreros verdes y amarillos, carritos de compras, ofertas imbatibles y un altar de cempasúchil en la caja registradora. ¡Siempre abre Mamá Lucha!',
    bannerColor: '#15803d',
    ambientFlavor: '¡Precios Bajos y Catorrazos!',
    hasMamaLuchaBanner: true,
  },
  {
    id: 'mercado',
    name: 'Mercado de Abastos',
    location: 'Nave de Frutas y Piñatas',
    description: 'El bullicio tradicional de la central de abastos: guacales de aguacate y jitomate, piñatas de 7 picos mecidas por el viento, papel picado tricolor y arcos de flores de cempasúchil.',
    bannerColor: '#c2410c',
    ambientFlavor: '¡Pásele marchante, lleve sus catorrazos!',
    hasMamaLuchaBanner: false,
  },
  {
    id: 'muertos',
    name: 'Plaza Día de Muertos',
    location: 'Zócalo Colonial del Mictlán',
    description: 'La mística plaza novohispana bajo la luna llena: catedral iluminada, alfombra dorada de pétalos de cempasúchil, altar monumental con veladoras parpadeantes y calaveras de azúcar.',
    bannerColor: '#6b21a8',
    ambientFlavor: '¡Viva México y el Día de Muertos!',
    hasMamaLuchaBanner: false,
  },
  {
    id: 'sayulita',
    name: 'Playa Sayulita',
    location: 'Costa del Pacífico: Tacos & Surf',
    description: 'El paraíso de la Riviera Nayarit al atardecer: palapa de tacos y ceviche, olas rompiendo contra el sol poniente, tablas de surf y brisa tropical.',
    bannerColor: '#0284c7',
    ambientFlavor: '¡Tacos, Ceviche, Surf y Vida!',
    hasMamaLuchaBanner: false,
  },
  {
    id: 'anubis_temple',
    name: 'Templo de Anubis',
    location: 'Ruinas del Desierto Místico',
    description: 'Antiguo santuario iluminado por antorchas y la luna llena, bajo la atenta mirada del dios Anubis y las pirámides en el horizonte.',
    bannerColor: '#4c1d95',
    ambientFlavor: '¡El Juicio de los Dioses!',
    hasMamaLuchaBanner: false,
  },
];
