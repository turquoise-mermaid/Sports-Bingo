const ADJECTIVES = [
  'Fierce', 'Swift', 'Bold', 'Iron', 'Golden', 'Silver', 'Wild', 'Rapid',
  'Blazing', 'Mighty', 'Brave', 'Soaring', 'Steel', 'Thunder', 'Crimson',
  'Turbo', 'Rocket', 'Shadow', 'Phantom', 'Arctic', 'Titan', 'Blaze',
  'Storm', 'Flash', 'Power', 'Hyper', 'Ultra', 'Viper', 'Rogue', 'Apex',
  'Prime', 'Elite', 'Hyper', 'Turbo', 'Sonic', 'Lunar', 'Solar', 'Neon',
];

const ANIMALS = [
  'Eagle', 'Hawk', 'Panther', 'Wolf', 'Bear', 'Lion', 'Tiger', 'Falcon',
  'Cobra', 'Shark', 'Bison', 'Mustang', 'Jaguar', 'Lynx', 'Raven', 'Bull',
  'Stallion', 'Osprey', 'Condor', 'Moose', 'Ram', 'Fox', 'Puma', 'Bronco',
  'Grizzly', 'Mako', 'Hornet', 'Badger', 'Cougar', 'Viper', 'Raptor',
];

export function generateRandomName(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `${adj}${animal}${num}`;
}
