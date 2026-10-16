/**
 * Преобразует код языка (например, 'ru', 'zh_cn', 'pt_br') в человекопонятное
 * самоназвание на его родном языке (например, 'Русский', '中文（中国）', 'Português')
 */
export function getLanguageTitle(code: string): string {
  try {
    // Преобразуем формат wows типа 'zh_cn' или 'pt_br' в стандарт BCP 47 ('zh-CN', 'pt-BR')
    const bcp47 = code.replace('_', '-');
    const nativeName = new Intl.DisplayNames([bcp47], { type: 'language' }).of(bcp47);
    if (!nativeName) return code.toUpperCase();
    return nativeName.charAt(0).toUpperCase() + nativeName.slice(1);
  } catch {
    return code.toUpperCase();
  }
}
