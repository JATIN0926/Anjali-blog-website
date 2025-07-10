import { Node, mergeAttributes } from '@tiptap/core'

export const Separator = Node.create({
  name: 'separator',

  group: 'block',

  atom: true,

  parseHTML() {
    return [
      {
        tag: 'div.separator',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { class: 'separator' }), 0]
  },
})
