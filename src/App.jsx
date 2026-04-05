import { useEffect, useState } from "react";
import { FaArrowUp } from "react-icons/fa";
import "./App.css";

function App() {
  const [surat, setSurat] = useState([]);
  const [detailSurat, setDetailSurat] = useState(null);
  const [active, setActive] = useState(null);
  const [search, setSearch] = useState("");
  const filteredSurat = surat.filter((item) =>
    item.namaLatin.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    // ambil list surat
    fetch("https://equran.id/api/v2/surat")
      .then((res) => res.json())
      .then((data) => {
        setSurat(data.data);
      });

    getDetailSurat(1);
    setActive(1);
  }, []);

  // Ambil detail surat
  const getDetailSurat = (nomor) => {
    fetch(`https://equran.id/api/v2/surat/${nomor}`)
      .then((res) => res.json())
      .then((data) => {
        setDetailSurat(data.data);
      });
  };

  return (
    <>
      <nav className="navbar navbar-dark px-4 navbar-custom d-flex justify-content-between">
        <span className="navbar-brand mb-0 h1">📖 Quran App</span>

        <input
          type="text"
          placeholder="🔍 Cari surat..."
          className="form-control w-25 rounded-pill"
          style={{ maxWidth: "250px" }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </nav>

      <div className="container-fluid">
        <div className="row">
          {/* SIDEBAR */}
          <div className="col-md-3 bg-light vh-100 overflow-auto p-3">
            <h5>Daftar Surat</h5>
            {filteredSurat.map((item) => (
              <div
                key={item.nomor}
                className={`sidebar-item border-bottom ${
                  active === item.nomor ? "active" : ""
                }`}
                onClick={() => {
                  getDetailSurat(item.nomor);
                  setActive(item.nomor);
                }}
              >
                {item.nomor}. {item.namaLatin}. ({item.nama})
              </div>
            ))}
          </div>

          {/* CONTENT */}
          <div className="col-md-9 p-4">
            {!detailSurat ? (
              <h3>Pilih surat di sebelah kiri</h3>
            ) : (
              <>
                <h2>
                  {detailSurat.namaLatin} ({detailSurat.nama})
                </h2>
                <p>
                  <b>Arti:</b> {detailSurat.arti}
                </p>
                <p>
                  <b>Jumlah Ayat:</b> {detailSurat.jumlahAyat}
                </p>
                <p>
                  <b>Tempat Turun:</b> {detailSurat.tempatTurun}
                </p>

                <hr />

                {detailSurat.ayat.map((ayat) => (
                  <div key={ayat.nomorAyat} className="mb-4">
                    <h4 style={{ textAlign: "right" }}>{ayat.teksArab}</h4>
                    <p>{ayat.teksLatin}</p>
                    <p>
                      <i>{ayat.teksIndonesia}</i>
                    </p>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="back-to-top"
      >
        <FaArrowUp />
      </button>
    </>
  );
}

export default App;
