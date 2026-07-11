import { theme, themeStylesheet, themeTokensStylesheet } from './theme';

describe('theme', () => {
  it('exposes the stylesheet entry point', () => {
    expect(theme()).toEqual(themeStylesheet);
  });

  it('points the token/stylesheet specifiers at the package', () => {
    expect(themeStylesheet).toContain('@tsai-pe/theme');
    expect(themeTokensStylesheet).toContain('@tsai-pe/theme');
  });
});
