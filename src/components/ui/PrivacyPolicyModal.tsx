import { Shield } from "lucide-react";
import { cvData } from "../../data/portfolioFacts";
import { Modal } from "./Modal";
import { CONSENT_STORAGE_KEY } from "../../hooks/useCookieConsent";

export interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * Clears the stored analytics choice and brings the consent banner back.
   * Omitted while no choice has been made yet, since there is nothing to
   * withdraw.
   */
  onChangeConsent?: (() => void) | undefined;
}

export function PrivacyPolicyModal({ isOpen, onClose, onChangeConsent }: PrivacyPolicyModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Privacy Policy"
      icon={<Shield className="w-6 h-6 text-cyan-400" aria-hidden="true" />}
      width="prose"
      closeLabel="Close privacy policy"
      bodyClassName="text-slate-300 space-y-6"
    >
      <p className="text-sm text-slate-400">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
      
      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-white">1. Data Controller</h3>
        <p>
          The data controller responsible for processing your personal data is:
        </p>
        <div className="pl-4 border-l-2 border-slate-700">
          <p className="font-medium text-slate-200">{cvData.header.name}</p>
          <p>
            NIP:{" "}
            <span className="inline-flex">
              {["946", "251", "62", "63"].map((part, i) => (
                <span key={i}>{part}</span>
              ))}
            </span>
          </p>
          <p>
            Email:{" "}
            <span className="inline-flex">
              {cvData.header.email.display.map((part, i) => (
                <span key={i}>{part}</span>
              ))}
            </span>
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-white">2. Introduction</h3>
        <p>
          Welcome to my personal portfolio website. I respect your privacy and am committed to protecting any personal data you may share while visiting this site. This Privacy Policy explains what information is collected, how it is used, and your rights regarding it.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-white">3. Information Collection and Use</h3>
        <p>
          This website is a static portfolio and does not directly collect personal data, create user accounts, or track individual users for marketing purposes. However, some data may be processed through third-party services:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-slate-200">Contact Form (Web3Forms):</strong> If you use the contact form, the information you provide (Name, Email, Message) is securely processed by a third-party email service, <strong>Web3Forms</strong>, solely for the purpose of delivering your inquiry to my inbox. Web3Forms does not store your data for their own marketing purposes. I do not store this data in any database or share it with other third parties. Please refer to the <a href="https://web3forms.com/privacy" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Web3Forms Privacy Policy</a> for more details.
          </li>
          <li>
            <strong className="text-slate-200">Hosting (GitHub Pages):</strong> This website is hosted on GitHub Pages. GitHub may collect standard server logs, including IP addresses of visitors, to maintain the security and performance of their service. Please refer to the <a href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">GitHub Privacy Statement</a> for more details. <strong className="text-slate-200">International Transfers:</strong> Since the website is hosted on GitHub Pages, your data (such as IP address) may be transferred to and processed in the United States. This transfer is based on Standard Contractual Clauses (SCCs) to ensure an adequate level of data protection as required by the GDPR.
          </li>
        </ul>
        <p>
          The legal basis for processing is legitimate interest (Article 6(1)(f) GDPR), which is communication related to professional inquiries.
        </p>
        <p>
          <strong className="text-slate-200">Data Retention:</strong> Personal data provided via the contact form will be stored only for the duration necessary to address your inquiry or until you request its deletion, unless further storage is required by law.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-white">4. Cookies and Analytics</h3>
        <p>
          This website uses <strong className="text-slate-200">Google Analytics 4</strong> to measure basic traffic and see which parts of the portfolio get read. It does not use advertising, remarketing or cross-site tracking cookies.
        </p>
        <p>
          Analytics runs on <strong className="text-slate-200">Google Consent Mode v2</strong> with every storage type denied by default. No analytics cookies are written and no measurement data is collected until you explicitly accept via the consent banner. Declining is a fully working state &ndash; the site behaves identically either way. Google Analytics 4 does not log full IP addresses, and no personally identifiable information is collected through it.
        </p>
        <p>
          Your choice is stored locally in your own browser under the key <code className="text-cyan-400 font-mono text-xs">{CONSENT_STORAGE_KEY}</code>. It never leaves your device.
        </p>
        {onChangeConsent && (
          <p>
            <button
              type="button"
              onClick={onChangeConsent}
              className="text-cyan-400 underline underline-offset-2 hover:text-cyan-300 transition-colors focus-ring rounded-sm"
            >
              Change or withdraw your analytics choice
            </button>
          </p>
        )}
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-white">5. Your Rights</h3>
        <p>
          Under the General Data Protection Regulation (GDPR) and other applicable privacy laws, you have the right to request access to, correction of, or deletion of any personal data you have sent me via the contact form. To exercise these rights, please contact me directly.
        </p>
        <p>
          <strong className="text-slate-200">Right to Lodge a Complaint:</strong> You have the right to lodge a complaint with a supervisory authority if you believe that the processing of your personal data violates the GDPR. In Poland, the competent authority is the President of the Personal Data Protection Office (Prezes Urzędu Ochrony Danych Osobowych), ul. Stawki 2, 00-193 Warsaw.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-white">6. Contact</h3>
        <p>
          If you have any questions about this Privacy Policy, please feel free to reach out via the contact form on this website.
        </p>
      </section>
    </Modal>
  );
}
