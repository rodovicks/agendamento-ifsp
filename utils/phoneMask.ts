


export function formatPhoneNumber(value: string): string {
  
  const phoneNumber = value.replace(/\D/g, '');

  
  if (!phoneNumber) return '';

  
  if (phoneNumber.length <= 2) {
    return `(${phoneNumber}`;
  } else if (phoneNumber.length <= 7) {
    return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`;
  } else if (phoneNumber.length <= 11) {
    return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7)}`;
  } else {
    
    const truncated = phoneNumber.slice(0, 11);
    return `(${truncated.slice(0, 2)}) ${truncated.slice(2, 7)}-${truncated.slice(7)}`;
  }
}


export function unformatPhoneNumber(value: string): string {
  return value.replace(/\D/g, '');
}


export function isValidPhoneNumber(value: string): boolean {
  const phoneNumber = unformatPhoneNumber(value);

  
  
  
  return phoneNumber.length === 10 || phoneNumber.length === 11;
}


