export const formatCategoryTitle = (title: string): string => {
  const words = title
    .trim()
    .toLowerCase()
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1));

  if (words.length === 0) {
    return "";
  }

  return words.length > 2 ? words.join("-") : words.join(" ");
};
