export function isCloseToGreen(color) {
  const [red, green, blue] = color;
  return green > 90 && red < 90 && blue < 90;
}

export function hideElement(element) {
  element.classList.add("hide");
  element.classList.remove("show");
}
export function showElement(element) {
  element.classList.add("show");
  element.classList.remove("hide");
}
