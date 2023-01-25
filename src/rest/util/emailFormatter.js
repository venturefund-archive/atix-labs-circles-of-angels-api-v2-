module.exports = {
  format: email => {
    if (!email) return '';
    const atPosition = email.indexOf('@');
    if (atPosition <= 0) return '';
    return (
      `${email.slice(0, atPosition / 2)}` +
      '...@...' +
      `${email.slice(atPosition + (email.length - atPosition) / 2)}`
    );
  }
};
