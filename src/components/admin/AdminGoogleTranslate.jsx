import { useEffect, useRef, useState } from "react";

const DEFAULT_LANGUAGE = "it";
const SUPPORTED_LANGUAGES =
  "ar,zh-CN,zh-TW,fr,de,hi,id,it,ja,ko,pt,ru,es,th,tr,vi";

let translateScriptRequested = false;

const applyItalianByDefault = () => {
  try {
    const value = `/en/${DEFAULT_LANGUAGE}`;
    document.cookie = `googtrans=${value};path=/;SameSite=Lax`;
    document.cookie = `googtrans=${value};path=/;domain=${window.location.hostname};SameSite=Lax`;
  } catch {
    // Google Translate can still be used manually if the browser blocks cookies.
  }
};

const AdminGoogleTranslate = () => {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let attempts = 0;

    applyItalianByDefault();

    const setItalianInWidget = () => {
      window.setTimeout(() => {
        const select = document.querySelector("#admin_google_translate_element .goog-te-combo");
        if (select && select.value !== DEFAULT_LANGUAGE) {
          select.value = DEFAULT_LANGUAGE;
          select.dispatchEvent(new Event("change"));
        }
      }, 350);
    };

    const initialise = () => {
      const container = containerRef.current;
      if (!mounted || !container || container.dataset.translateReady === "true") return;
      if (!window.google?.translate?.TranslateElement) return;

      try {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: SUPPORTED_LANGUAGES,
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
            multilanguagePage: true,
          },
          "admin_google_translate_element"
        );
        container.dataset.translateReady = "true";
        setItalianInWidget();
      } catch {
        // The widget may already have initialised while React was rendering.
      } finally {
        if (mounted) setLoading(false);
      }
    };

    window.adminGoogleTranslateElementInit = initialise;

    if (window.google?.translate?.TranslateElement) {
      initialise();
    } else if (!translateScriptRequested) {
      translateScriptRequested = true;
      const script = document.createElement("script");
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=adminGoogleTranslateElementInit";
      script.async = true;
      script.onerror = () => {
        if (mounted) setLoading(false);
      };
      document.body.appendChild(script);
    }

    const checkForWidget = () => {
      attempts += 1;
      if (!mounted || attempts > 40) {
        if (mounted) setLoading(false);
        return;
      }

      initialise();
      if (containerRef.current?.querySelector(".goog-te-gadget")) {
        setLoading(false);
        return;
      }
      window.setTimeout(checkForWidget, attempts < 10 ? 150 : 500);
    };

    window.setTimeout(checkForWidget, 150);

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="admin-google-translate" aria-label="Language selector">
      <div id="admin_google_translate_element" ref={containerRef}>
        {loading ? <span className="admin-google-translate__loading">Italiano</span> : null}
      </div>
    </div>
  );
};

export default AdminGoogleTranslate;
