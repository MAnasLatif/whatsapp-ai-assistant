/**
 * Popup Styles
 */

export function createPopupStyles(): string {
  return `
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        background: #f5f5f5;
        color: #333;
        line-height: 1.5;
      }

      .popup-container {
        width: 450px;
        max-height: 600px;
        background: #fff;
        display: flex;
        flex-direction: column;
      }

      .popup-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 20px;
        border-bottom: 1px solid #e5e5e5;
        background: linear-gradient(135deg, #00a884 0%, #008069 100%);
        color: #fff;
      }

      .header-icon {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .popup-title {
        font-size: 18px;
        font-weight: 600;
      }

      .popup-content {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
      }

      .popup-section {
        margin-bottom: 24px;
      }

      .popup-section:last-child {
        margin-bottom: 0;
      }

      .section-title {
        font-size: 14px;
        font-weight: 600;
        color: #00a884;
        margin-bottom: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .form-group {
        margin-bottom: 16px;
      }

      .form-label {
        display: block;
        font-size: 13px;
        font-weight: 500;
        color: #333;
        margin-bottom: 6px;
      }

      .form-input,
      .form-select {
        width: 100%;
        padding: 10px 12px;
        font-size: 14px;
        border: 1px solid #d0d0d0;
        border-radius: 8px;
        background: #fff;
        color: #333;
        transition: border-color 0.2s;
      }

      .form-input:focus,
      .form-select:focus {
        outline: none;
        border-color: #00a884;
      }

      .form-input[type="number"] {
        -moz-appearance: textfield;
      }

      .form-input[type="number"]::-webkit-outer-spin-button,
      .form-input[type="number"]::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }

      .form-hint {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 6px;
        font-size: 12px;
      }

      .btn-link {
        background: none;
        border: none;
        color: #00a884;
        cursor: pointer;
        font-size: 12px;
        padding: 0;
        text-decoration: underline;
      }

      .btn-link:hover {
        color: #008069;
      }

      .toggle-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 0;
        border-bottom: 1px solid #f0f0f0;
      }

      .toggle-item:last-child {
        border-bottom: none;
      }

      .toggle-content {
        flex: 1;
      }

      .toggle-label {
        font-size: 14px;
        font-weight: 500;
        color: #333;
      }

      .toggle-description {
        font-size: 12px;
        color: #666;
        margin-top: 2px;
      }

      .toggle-switch {
        position: relative;
        display: inline-block;
        width: 44px;
        height: 24px;
        cursor: pointer;
      }

      .toggle-switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }

      .toggle-slider {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        border-radius: 24px;
        transition: 0.3s;
      }

      .toggle-slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        border-radius: 50%;
        transition: 0.3s;
      }

      .toggle-switch input:checked + .toggle-slider {
        background-color: #00a884;
      }

      .toggle-switch input:checked + .toggle-slider:before {
        transform: translateX(20px);
      }

      .info-box {
        display: flex;
        gap: 12px;
        padding: 12px;
        background: #f0f9ff;
        border: 1px solid #bae6fd;
        border-radius: 8px;
      }

      .info-icon {
        font-size: 20px;
        line-height: 1;
      }

      .info-content {
        flex: 1;
        font-size: 13px;
        color: #0369a1;
        line-height: 1.5;
      }

      .info-content strong {
        font-weight: 600;
      }

      .popup-footer {
        padding: 16px;
        border-top: 1px solid #e5e5e5;
        background: #fafafa;
      }

      .btn-primary {
        width: 100%;
        padding: 12px 24px;
        font-size: 14px;
        font-weight: 600;
        color: #fff;
        background: #00a884;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s;
      }

      .btn-primary:hover {
        background: #008069;
      }

      .btn-primary:disabled {
        background: #ccc;
        cursor: not-allowed;
      }

      .status-success {
        color: #16a34a;
        font-weight: 500;
      }

      .status-error {
        color: #dc2626;
        font-weight: 500;
      }

      .status-info {
        color: #666;
      }

      /* Scrollbar styling */
      .popup-content::-webkit-scrollbar {
        width: 6px;
      }

      .popup-content::-webkit-scrollbar-track {
        background: #f5f5f5;
      }

      .popup-content::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 3px;
      }

      .popup-content::-webkit-scrollbar-thumb:hover {
        background: #999;
      }
    </style>
  `;
}
