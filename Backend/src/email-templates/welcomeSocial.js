// emails/welcome/socialWelcome.js
export const socialWelcomeMail = (userName) => {
  return {
    subject: "Welcome to the other side of “normal”",
    html: `
      <p>Hi ${userName || ""},</p>

      <p>Thanks for subscribing to the Social Patterns section of my blog — where I explore how society silently shapes the way we think, feel, and behave.</p>

      <p>Here, I decode questions like:</p>
      <ul>
        <li>Why do we shame men for feeling and women for speaking up?</li>
        <li>How does society gaslight people into believing that burnout is ambition?</li>
        <li>Are your beliefs really yours — or something you inherited quietly, without consent?</li>
      </ul>

      <p>I write about these patterns not to give answers, but to untangle the noise.</p>

      <p>Expect one thought-provoking story every week. Raw, researched, and written for people who are tired of just surviving culture — and ready to see through it.</p>

      <p>Let’s question what we’ve been taught to normalize.</p>

      <br/>
      <p>Talk soon,<br/>Anjali Chaudhary</p>
    `,
  };
};
