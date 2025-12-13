/**
 * Settings Button Component
 * FR-01, FR-02: AI settings button positioned with native WhatsApp styling
 */

import type { WhatsAppTheme } from "@/utils/types";

export class SettingsButton {
  public element: HTMLButtonElement;
  private theme: WhatsAppTheme;
  private onClick: () => void;

  constructor(theme: WhatsAppTheme, onClick: () => void) {
    this.theme = theme;
    this.onClick = onClick;
    this.element = this.createElement();
  }

  private createElement(): HTMLButtonElement {
    const button = document.createElement("button");
    button.className =
      "wa-ai-settings-btn html-button xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x178xt8z x1lun4ml xso031l xpilrb4 x1n2onr6 x1ejq31n x18oe1m7 x1sy0etr xstzfhl x1so62im x1syfmzz x1ja2u2z x1ypdohk x1s928wv x1j6awrg x4eaejv x1wsn0xg x1r0yslu x2q1x1w xapdjt xr6f91l x5rv0tg x1akc3lz xikp0eg x1xl5mkn x1mfml39 x1l5mzlr xgmdoj8 x1f1wgk5 x1x3ic1u xjbqb8w xuwfzo9 xy0j11r xg268so x1b4bgnk x1wb366y xtnn1bt x9v5kkp xmw7ebm xrdum7p x2lah0s x1lliihq xk8lq53 x9f619 xt8t1vi x1xc408v x129tdwq x15urzxu x1vqgdyp x100vrsf";
    button.setAttribute("aria-label", "AI Assistant Settings");
    button.setAttribute("title", "AI Assistant Settings");
    button.setAttribute("type", "button");
    button.setAttribute("tabindex", "0");
    button.setAttribute("aria-disabled", "false");

    // Create inner structure matching WhatsApp's button structure
    button.innerHTML = `
      <div class="html-div xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl">
        <div class="html-div xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x6s0dn4 x78zum5 x1q0g3np xh8yej3 xl56j7k">
          <div class="html-div xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x6s0dn4 x78zum5 x1vjfegm">
            <span aria-hidden="true" class="xxk0z11 xvy4d1p">
              ${this.getIcon()}
            </span>
          </div>
          <div class="html-div xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x6s0dn4 x78zum5 x1vjfegm x1c4vz4f"></div>
        </div>
      </div>
    `;

    button.addEventListener("click", this.handleClick);

    return button;
  }

  private handleClick = (e: Event): void => {
    e.stopPropagation();
    this.onClick();
  };

  private getIcon(): string {
    // AI Sparkle/Stars icon - clean and recognizable
    return `
      <svg viewBox="0 0 24 24" height="24" width="24" preserveAspectRatio="xMidYMid meet" class="" fill="none">
        <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M5 3v4M3 5h4M19 17v4M17 19h4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
  }

  updateTheme(theme: WhatsAppTheme): void {
    this.theme = theme;
    // Theme updates handled by CSS
  }

  destroy(): void {
    this.element.removeEventListener("click", this.handleClick);
    this.element.remove();
  }
}
