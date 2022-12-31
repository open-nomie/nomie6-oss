export default function autoresize(node) {
  function handleChange() {
    if (node.scrollHeight > 60) {
      node.style.height = `${node.scrollHeight}px`;
    }
  }

  handleChange();
  node.addEventListener("input", handleChange);

  return {
    destroy() {
      node.removeEventListener("input", handleChange);
    },
  };
}
