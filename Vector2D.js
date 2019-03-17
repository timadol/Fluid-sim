function Vector2D(x, y) {
  if (x)
    this.x = x;
  else
    this.x = 0;
  if (y)
    this.y = y;
  else
    this.y = 0;
}
Vector2D.prototype.dotProduct = function (vector1, vector2) {
  return vector1.x * vector2.x + vector1.y * vector2.y;
};
Vector2D.prototype.multyply = function (vector, a) {
  var result = Object.create(vector);
  result.x = vector.x * a;
  result.y = vector.y * a;
  return result;
};
Vector2D.prototype.summ = function (vector1, vector2) {
  var result = Object.create(vector);
  result.x = vector1.x + vector2.x;
  result.y = vector1.y + vector2.y;
  return result;
};
Vector2D.prototype.subtract = function (vector1, vector2) {
  var result = Object.create(vector);
  result.x = vector1.x - vector2.x;
  result.y = vector1.y - vector2.y;
  return result;
};
Vector2D.prototype.lenghtSqr = function () {
  return vector.dotProduct(this, this);
};
Vector2D.prototype.normalize = function () {
  var lenght = Math.sqrt(this.lenghtSqr());
  this.x /= lenght;
  this.y /= lenght;
};
