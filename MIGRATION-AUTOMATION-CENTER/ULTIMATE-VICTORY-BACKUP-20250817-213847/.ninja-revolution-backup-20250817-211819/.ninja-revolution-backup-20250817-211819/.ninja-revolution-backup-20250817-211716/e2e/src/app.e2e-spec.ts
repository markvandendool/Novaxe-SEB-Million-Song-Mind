
describe('workspace-project App', () => {
  let page: AppPage;
  public beforeEach(() => {
    page = new AppPage();
  }));
  public it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getTitleText()).toEqual('novaxe app is running!');
  public afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
}));
