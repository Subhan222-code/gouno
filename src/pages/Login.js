import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import croppedImage from '../assets/poster.png';

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = form.email.trim();
    const password = form.password;

    if (!email || !password) {
      setErrorMsg('Email dan password harus diisi.');
      return;
    }

    console.log('Login attempt:', email); // Hindari log password

    try {
      setLoading(true);
      setErrorMsg('');

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const { username, email } = userDocSnap.data();

        localStorage.setItem(
          'userProfile',
          JSON.stringify({ username, email, uid: user.uid })
        );

        navigate('/play');
      } else {
        setErrorMsg('Data pengguna tidak ditemukan di database.');
      }
    } catch (error) {
      console.error('Login error code:', error.code);

      if (error.code === 'auth/user-not-found') {
        setErrorMsg('Akun tidak ditemukan.');
      } else if (error.code === 'auth/wrong-password') {
        setErrorMsg('Password salah.');
      } else if (error.code === 'auth/invalid-email') {
        setErrorMsg('Format email tidak valid.');
      } else if (error.code === 'auth/invalid-credential') {
        setErrorMsg('Credential tidak valid. Cek kembali email dan password.');
      } else {
        setErrorMsg('Terjadi kesalahan saat login.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        backgroundImage: `url(${croppedImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
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
        <h2 style={{ marginBottom: '24px', textAlign: 'center' }}>Login</h2>

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
          disabled={loading}
          style={{
            backgroundColor: loading ? '#ccc' : '#FFD700',
            padding: '14px 0',
            borderRadius: '10px',
            border: 'none',
            fontWeight: '700',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.3s ease',
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = '#e6c200';
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = '#FFD700';
          }}
        >
          {loading ? 'Memproses...' : 'Login'}
        </button>

        {errorMsg && (
          <p style={{ marginTop: '12px', textAlign: 'center', color: '#fff' }}>
            {errorMsg}
          </p>
        )}

        <p style={{ marginTop: '20px', textAlign: 'center' }}>
          Belum punya akun?{' '}
          <Link to="/register" style={{ color: '#FFD700', textDecoration: 'underline' }}>
            Daftar
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
