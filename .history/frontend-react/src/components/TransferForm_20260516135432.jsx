import { useState } from "react";
import { transferToken } from "../api/blockchain";

export default function TransferForm() {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");

  const submit = async (e) => {
    e.preventDefault(); // Mencegah halaman web me-refresh saat tombol ditekan
    
    try {
      const res = await transferToken({ to, amount });
      alert("Success");
      
      // Catatan: Jika ingin menggunakan loadBalance(), pastikan ia 
      // dikirim sebagai props dari komponen induk (parent)
      // loadBalance(); 
    } catch (error) {
      console.error(error);
      alert("Gagal melakukan transfer");
    }
  };

  return (
    <form onSubmit={submit}>
      <h2>Transfer Token</h2>

      <input
        placeholder="Address tujuan"
        value={to}
        onChange={(e) => setTo(e.target.value)}
      />

      <input
        placeholder="Jumlah"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      {/* Mengubah tombol biasa menjadi tombol tipe submit */}
      <button type="submit">Kirim</button>
    </form>
  );
}