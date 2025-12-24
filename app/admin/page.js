'use client';

import { useState } from 'react';
import styles from './admin.module.css';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [searches, setSearches] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stats', password }),
      });

      if (!res.ok) {
        setError('كلمة المرور غير صحيحة');
        setLoading(false);
        return;
      }

      const data = await res.json();
      setStats(data);
      setIsLoggedIn(true);
      loadAllData();
    } catch (err) {
      setError('خطأ في الاتصال: ' + err.message);
    }
    setLoading(false);
  };

  const loadAllData = async () => {
    try {
      // تحميل النشاطات
      const activitiesRes = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'activities', password }),
      });
      const activitiesData = await activitiesRes.json();
      setActivities(activitiesData.activities || []);

      // تحميل البحث
      const searchesRes = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'searches', password }),
      });
      const searchesData = await searchesRes.json();
      setSearches(searchesData.topSearches || []);

      // تحميل المستخدمين
      const usersRes = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'users', password }),
      });
      const usersData = await usersRes.json();
      setUsers(usersData.users || []);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className={styles.loginContainer}>
        <div className={styles.loginBox}>
          <h1>🔐 لوحة التحكم</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="أدخل كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'جاري التحميل...' : 'دخول'}
            </button>
            {error && <p className={styles.error}>{error}</p>}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1>📊 لوحة التحكم</h1>
        <button onClick={() => { setIsLoggedIn(false); setPassword(''); }}>
          تسجيل خروج
        </button>
      </header>

      {/* الإحصائيات الرئيسية */}
      <section className={styles.statsSection}>
        <h2>📈 الإحصائيات</h2>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats?.totalImages || 0}</div>
            <div className={styles.statLabel}>📸 عدد الصور</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats?.totalUsers || 0}</div>
            <div className={styles.statLabel}>👥 عدد المستخدمين</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats?.totalFavorites || 0}</div>
            <div className={styles.statLabel}>❤️ المفضلات</div>
          </div>
        </div>
      </section>

      {/* أكثر الصور مشهورة */}
      <section className={styles.section}>
        <h2>🔥 أكثر الصور مشهورة</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>الرابط</th>
              <th>الزيارات</th>
              <th>المفضلات</th>
            </tr>
          </thead>
          <tbody>
            {stats?.topImages?.map((img, idx) => (
              <tr key={idx}>
                <td>
                  <a href={img.imageUrl} target="_blank" rel="noopener noreferrer">
                    اعرض الصورة
                  </a>
                </td>
                <td>{img.viewCount || 0}</td>
                <td>{img.favoriteCount || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* أكثر عمليات بحث */}
      <section className={styles.section}>
        <h2>🔍 أكثر البحثيات</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>الكلمة المفتاحية</th>
              <th>عدد البحثيات</th>
            </tr>
          </thead>
          <tbody>
            {searches?.map((item, idx) => (
              <tr key={idx}>
                <td>{item.query}</td>
                <td>{item.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* آخر النشاطات */}
      <section className={styles.section}>
        <h2>📝 آخر النشاطات</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>المستخدم</th>
              <th>الإجراء</th>
              <th>التفاصيل</th>
              <th>الوقت</th>
            </tr>
          </thead>
          <tbody>
            {activities?.slice(0, 20).map((act, idx) => (
              <tr key={idx}>
                <td>{act.userId}</td>
                <td>{act.action}</td>
                <td>{act.details}</td>
                <td>{new Date(act.timestamp).toLocaleString('ar')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* المستخدمين */}
      <section className={styles.section}>
        <h2>👥 المستخدمين</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>اسم المستخدم</th>
              <th>المفضلات</th>
              <th>آخر نشاط</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user, idx) => (
              <tr key={idx}>
                <td>{user.username}</td>
                <td>{user.favoriteCount}</td>
                <td>{new Date(user.lastActive).toLocaleString('ar')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
