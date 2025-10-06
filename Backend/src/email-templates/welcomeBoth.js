// emails/welcome/bothWelcome.js
export const bothWelcomeMail = (userName) => {
  return {
    subject: "Welcome to a space where inner life meets outer world",
    html: `
      <p>Hey ${userName || ""},</p>

      <p>Thank you for joining my blog — a space where I write from both the heart and the mind.</p>

      <p>There are two types of stories I share:</p>
      <ul>
        <li>🟣 Personal Journal Entries — raw reflections on trauma, softness, identity, and emotional healing</li>
        <li>🟡 Social Patterns Essays — thoughtful takes on the world we live in, how culture shapes us, and how we push back</li>
      </ul>

      <p>I believe storytelling is both medicine and rebellion. Some weeks, you’ll receive one journal entry. Other weeks, a social lens. Sometimes both.</p>

      <p>Whichever speaks to you — thank you for reading.</p>

      <p>If any post hits home, I’d love to hear from you.</p>

      <br/>
      <p>Warmly,<br/>Anjali Chaudhary</p>
    `,
  };
};
