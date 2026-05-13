/** Vietnamese phone number: 10 digits starting with 0 */
export function validatePhone(phone: string): boolean {
  return /^0[35789]\d{8}$/.test(phone.replace(/\s/g, ""))
}

/** Vietnamese CCCD (12 digits) or old CMND (9 digits) */
export function validateCCCD(id: string): boolean {
  const clean = id.replace(/\s/g, "")
  return /^\d{9}$/.test(clean) || /^\d{12}$/.test(clean)
}

/** Vietnamese tax code: 10 or 13 digits (with optional dash before last 3) */
export function validateTaxCode(taxCode: string): boolean {
  const clean = taxCode.replace(/[-\s]/g, "")
  return /^\d{10}$/.test(clean) || /^\d{13}$/.test(clean)
}

/** Bank account number: 6-20 digits */
export function validateBankAccount(accountNumber: string): boolean {
  const clean = accountNumber.replace(/\s/g, "")
  return /^\d{6,20}$/.test(clean)
}

/** Email basic validation */
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
