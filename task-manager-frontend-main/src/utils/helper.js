export const validateUsername = (username) => {
  // A basic regex for username: allows alphanumeric, underscore, hyphen, 3-16 characters long
  const regex = /^[a-zA-Z0-9_-]{3,16}$/;
  return regex.test(username);
};

export const addThousandsSeparator = num => {
    if(num == null || isNaN(num)) return "";

    const [integerPart, fractionalPart] = num.toString().split(".");
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    return fractionalPart ? `${formattedInteger}.${fractionalPart}` : formattedInteger;
}