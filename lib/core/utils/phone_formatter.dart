class PhoneFormatter {
  /// Converte qualquer número BR para E.164 (+55XXXXXXXXXXX)
  static String toE164(String raw) {
    final digits = raw.replaceAll(RegExp(r'\D'), '');
    if (digits.startsWith('55') && digits.length >= 12) {
      return '+$digits';
    }
    if (digits.startsWith('0') && digits.length >= 11) {
      return '+55${digits.substring(1)}';
    }
    if (digits.length >= 10) {
      return '+55$digits';
    }
    return '+55$digits';
  }

  /// Formata E.164 para exibição amigável: +55 (62) 99988-7766
  static String toDisplay(String e164) {
    final digits = e164.replaceAll(RegExp(r'\D'), '');
    if (digits.length == 12) {
      // fixo: +55 (XX) XXXX-XXXX
      return '+${digits.substring(0, 2)} (${digits.substring(2, 4)}) ${digits.substring(4, 8)}-${digits.substring(8)}';
    }
    if (digits.length == 13) {
      // celular: +55 (XX) 9XXXX-XXXX
      return '+${digits.substring(0, 2)} (${digits.substring(2, 4)}) ${digits.substring(4, 9)}-${digits.substring(9)}';
    }
    return e164;
  }

  /// Valida se o número segue o padrão E.164 BR
  static bool isValidBR(String number) {
    return RegExp(r'^\+55[0-9]{10,11}$').hasMatch(number);
  }

  /// Extrai DDD do número E.164
  static String? extractDDD(String e164) {
    final digits = e164.replaceAll(RegExp(r'\D'), '');
    if (digits.length >= 4) {
      return digits.substring(2, 4);
    }
    return null;
  }

  /// Mascara parcialmente o número para privacidade
  static String mask(String e164) {
    final display = toDisplay(e164);
    if (display.length < 8) return display;
    final start = display.substring(0, display.length - 4);
    return '${start}****';
  }
}
