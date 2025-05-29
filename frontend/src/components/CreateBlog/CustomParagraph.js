// extensions/CustomParagraph.js
import Paragraph from "@tiptap/extension-paragraph";

const CustomParagraph = Paragraph.extend({
  name: 'paragraph', // ✅ Ensure this replaces the default 'paragraph'

  addAttributes() {
    return {
      class: {
        default: null,
        parseHTML: (element) => element.getAttribute("class"),
        renderHTML: (attributes) => {
          return {
            class: attributes.class || null,
          };
        },
      },
    };
  },
});

export default CustomParagraph;
