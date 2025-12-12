import "./footer.css";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-inner">
        <span className="footer-brand">FinanceApp © {year}</span>
        <span className="footer-note">
          Dibuat dengan ❤️ oleh Kelompok Kami
        </span>
      </div>
    </footer>
  );
}
