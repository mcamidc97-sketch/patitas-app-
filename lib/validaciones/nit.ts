/**
 * Valida un NIT colombiano según el algoritmo oficial de la DIAN.
 * Formato esperado: XXXXXXXXX-X (9 dígitos, guión, dígito verificador)
 */
export function validarNIT(nit: string): { valido: boolean; error?: string } {
  const limpio = nit.trim().replace(/\s/g, '')

  if (!/^\d{9}-\d$/.test(limpio)) {
    return {
      valido: false,
      error: 'El NIT debe tener el formato XXXXXXXXX-X (ej: 900123456-7)',
    }
  }

  const [base, verificadorStr] = limpio.split('-')
  const digitos = base.split('').map(Number)
  const verificador = parseInt(verificadorStr)

  // Factores del algoritmo DIAN aplicados de izquierda a derecha
  const factores = [41, 37, 29, 23, 19, 17, 13, 7, 3]
  const suma = digitos.reduce((acc, d, i) => acc + d * factores[i], 0)
  const residuo = suma % 11
  const digitoEsperado = residuo <= 1 ? residuo : 11 - residuo

  if (verificador !== digitoEsperado) {
    return {
      valido: false,
      error: `Dígito verificador incorrecto (se esperaba ${digitoEsperado})`,
    }
  }

  return { valido: true }
}

/** Formatea un string de dígitos al formato NIT colombiano XXXXXXXXX-X */
export function formatearNIT(valor: string): string {
  const soloDigitos = valor.replace(/\D/g, '')
  if (soloDigitos.length <= 9) return soloDigitos
  return soloDigitos.slice(0, 9) + '-' + soloDigitos.slice(9, 10)
}
