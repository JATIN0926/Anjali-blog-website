export const getNewBlogMailContent = (blog) => {
    const { title, content, type, _id } = blog;
  
    const previewText = content
      .replace(/<[^>]+>/g, "")
      .split(/\r?\n/) 
      .filter(line => line.trim() !== "")
      .slice(0, 4)
      .join("<br/>")
      .slice(0, 400);
  
    const blogUrl = `${process.env.CLIENT_URL}/blog/${_id}`;
  
    if (type === "Article") {
      return {
        subject: `${title} - A new social pattern`,
        html: `
        <div style="font-family: 'Inter', sans-serif; color: #222; line-height: 1.6; padding: 20px; max-width: 600px; margin: auto;">
          <p>Hi there,</p>
          <p>I just published a new story in <b>Social Pattern</b> — a space where I explore how society quietly shapes the way we think, feel, and behave.</p>
          <p>This piece looks at patterns we rarely question — the ones we live inside every day. It’s honest, reflective, and maybe a bit unsettling.</p>
          <h2 style="margin-top: 30px;">${title}</h2>
          <p>${previewText}...</p>
          <a href="${blogUrl}" target="_blank" style="display: inline-block; margin-top: 20px; padding: 10px 18px; background: #000; color: #fff; text-decoration: none; border-radius: 4px;">Read more →</a>
          <br/><br/>
          <p>— <b>Anjali</b><br/>Observing the loops we live in</p>
        </div>`
      };
    }
  
    if (type === "Diary") {
      return {
        subject: `${title} - Open my diary`,
        html: `
        <div style="font-family: 'Inter', sans-serif; color: #222; line-height: 1.6; padding: 20px; max-width: 600px; margin: auto;">
          <p>Hey,</p>
          <p>I’ve shared something new in <b>My Diary</b> — a space where I write without filters. These entries aren’t lessons or essays, just moments I want to remember.</p>
          <p>This one’s a little messy, a little unsure, but deeply mine.</p>
          <h2 style="margin-top: 30px;">${title}</h2>
          <p>${previewText}...</p>
          <a href="${blogUrl}" target="_blank" style="display: inline-block; margin-top: 20px; padding: 10px 18px; background: #000; color: #fff; text-decoration: none; border-radius: 4px;">Open My Diary →</a>
          <br/><br/>
          <p>— <b>Anjali</b><br/>Keeping space for quiet truths and experiences.</p>
        </div>`
      };
    }
  
    return null;
  };
  