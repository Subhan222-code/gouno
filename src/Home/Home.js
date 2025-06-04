import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import background from '../assets/poster.png';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      alert('Login berhasil!');
      navigate('/play');
    } catch (error) {
      console.error('Login error:', error);
      if (error.code === 'auth/user-not-found') {
        alert('Akun tidak ditemukan.');
      } else if (error.code === 'auth/wrong-password') {
        alert('Password salah.');
      } else if (error.code === 'auth/invalid-email') {
        alert('Format email tidak valid.');
      } else {
        alert('Terjadi kesalahan saat login.');
      }
    }
  };

  return (
    <div
      className="home-container"
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: 'rgb(255, 78, 24)',
          padding: '40px 35px',
          borderRadius: '12px',
          boxShadow: '0 8px 16px rgb(253, 237, 3)',
          display: 'flex',
          flexDirection: 'column',
          width: 320,
          color: '#ffffff',
        }}
      >
        <h2 style={{ marginBottom: '24px', textAlign: 'center', fontSize: '24px' }}>Login</h2>

        {['email', 'password'].map((field) => (
          <label
            key={field}
            style={{
              display: 'flex',
              flexDirection: 'column',
              marginBottom: '20px',
              fontWeight: '600',
              fontSize: '14px',
              letterSpacing: '0.5px',
              textTransform: 'capitalize',
            }}
          >
            {field.charAt(0).toUpperCase() + field.slice(1)}
            <input
              type={field === 'password' ? 'password' : 'email'}
              name={field}
              value={form[field]}
              onChange={handleChange}
              required
              style={{
                marginTop: '8px',
                padding: '12px 14px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '16px',
                outline: 'none',
              }}
            />
          </label>
        ))}

        <button
          type="submit"
          style={{
            backgroundColor: '#2978f0',
            padding: '14px 0',
            borderRadius: '10px',
            border: 'none',
            fontWeight: '700',
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1a5edb')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2978f0')}
        >
          Login
        </button>

        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '16px'}}>
          Belum punya akun?{' '}
          <Link to="/register" style={{ color: '#FFD700', textDecoration: 'underline' }}>
            Daftar
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Home;
