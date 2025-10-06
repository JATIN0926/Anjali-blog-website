// emails/welcome/diaryWelcome.js
export const diaryWelcomeMail = (userName) => {
  return {
    subject: "You’re not alone — welcome to my journal",
    html: `
      <p>Hey ${userName || ""},</p>

      <p>Thank you for joining my journal space. I write here not as an expert, but as someone navigating emotions, identity, and healing in real time — just like you.</p>

      <p>In these journal entries, I talk about:</p>
      <ul>
        <li>Growing up in chaos and learning softness</li>
        <li>What it means to outgrow people you love</li>
        <li>The quiet power of choosing yourself</li>
      </ul>

      <p>You’ll get 1–2 deeply personal entries each week. Sometimes raw. Sometimes poetic. Always honest.</p>

      <p>If you ever feel something deeply, reply to me. I read everything.</p>

      <br/>
      <p>With softness,<br/>Anjali Chaudhary</p>
    `,
  };
};
