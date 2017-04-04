import { DbrngPage } from './app.po';

describe('dbrng App', () => {
  let page: DbrngPage;

  beforeEach(() => {
    page = new DbrngPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
