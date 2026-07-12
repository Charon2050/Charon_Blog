(() => {
  "use strict";
  const style = document.createElement("style");
  style.textContent = `
    #deving-notice-dialog {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }
    #deving-notice-dialog:not([open]) {
      display: none;
    }
  `;
  document.head.appendChild(style);

  // 页面加载完成后再弹出
  window.addEventListener("DOMContentLoaded", () => {
    // 避免重复创建
    if (document.getElementById("deving-notice-dialog")) {
      return;
    }

    const dialog = document.createElement("dialog");
    dialog.id = "deving-notice-dialog";

    const icon = document.createElement("div");
    icon.style = "font-size: 4rem;";
    icon.textContent = "🚧";

    const title = document.createElement("h2");
    title.style = "margin: 0;";
    title.textContent = "页面开发中";

    const description = document.createElement("p");
    description.style = "margin: 0 0 1rem 0; color: #888; font-size: 0.9rem;";
    description.textContent = "本页面正在开发中，有些功能尚不完善。";

    const backButton = document.createElement("button");
    backButton.style = "width: 100%; min-width: 7rem;";
    backButton.className = "primary";
    backButton.textContent = "返回";

    const continueButton = document.createElement("button");
    continueButton.style = "width: 100%; min-width: 7rem;";
    continueButton.textContent = "继续访问";

    backButton.addEventListener("click", () => {
      if (history.length > 1) {
        history.back();
      } else {
        location.href = "/";
      }
    });

    continueButton.addEventListener("click", () => {
      dialog.close();
    });

    dialog.append(
      icon,
      title,
      description,
      backButton,
      continueButton
    );

    document.body.appendChild(dialog);
    dialog.showModal();
  });
})();
