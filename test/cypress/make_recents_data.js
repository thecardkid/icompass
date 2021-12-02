const articles = ['A', 'The'];
const nouns = ['Time', 'Person', 'Year', 'Way', 'Day', 'Thing', 'Man', 'World', 'Life', 'Hand', 'Part', 'Child', 'Eye', 'Woman', 'Place', 'Work', 'Week', 'Case', 'Point', 'Government', 'Company', 'Number', 'Group', 'Problem', 'Fact'];
const adjectives = ['Good', 'New', 'First', 'Last', 'Long', 'Great', 'Little', 'Own', 'Other', 'Old', 'Right', 'Big', 'High', 'Different','Small', 'Large', 'Next', 'Early', 'Young', 'Important', 'Few', 'Public', 'Bad', 'Same', 'Able'];
const randomFrom = (items) => items[Math.floor(Math.random()*items.length)];
const makeName = () => randomFrom(articles) + ' ' + randomFrom(adjectives) + ' ' + randomFrom(nouns);
const makeCode = (i) => `${i}`.padStart(2, '0') + 'gf8kdj';
export const makeData = (num) => {
  const out = {};
  for (let i = 0; i < num; i++) {
    const isViewOnly = randomFrom([true, false]);
    const code = makeCode(i);
    out[code] = {
      url: [
        '',
        'compass',
        isViewOnly ? 'view' : 'edit',
        code,
        isViewOnly ? '' : 'User',
      ].join('/'),
      visitedAt: new Date().getTime(),
      isViewOnly,
      topic: makeName(),
    };
  }
  return out;
};

if (process.env['NODE_ENV'] !== 'test') {
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(makeData(parseInt((process.argv[2])))));
}
