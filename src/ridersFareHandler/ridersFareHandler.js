exports.calculateRidersFare = async distance => {
  if (+distance > 1 && +distance < 2) {
    return (this.riderFare = 30);
  }
};
