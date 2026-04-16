import { Platform } from 'react-native';

const fontFamily = Platform.OS === 'ios' ? 'System' : 'Roboto';

export const typography = {
  h1: { fontFamily, fontSize: 28, fontWeight: '700', lineHeight: 36 },
  h2: { fontFamily, fontSize: 22, fontWeight: '700', lineHeight: 30 },
  h3: { fontFamily, fontSize: 18, fontWeight: '600', lineHeight: 26 },
  h4: { fontFamily, fontSize: 16, fontWeight: '600', lineHeight: 24 },
  body: { fontFamily, fontSize: 14, fontWeight: '400', lineHeight: 22 },
  bodyBold: { fontFamily, fontSize: 14, fontWeight: '600', lineHeight: 22 },
  small: { fontFamily, fontSize: 12, fontWeight: '400', lineHeight: 18 },
  smallBold: { fontFamily, fontSize: 12, fontWeight: '600', lineHeight: 18 },
  caption: { fontFamily, fontSize: 11, fontWeight: '400', lineHeight: 16 },
  button: { fontFamily, fontSize: 15, fontWeight: '600', lineHeight: 22 },
};
