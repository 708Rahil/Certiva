'use client';

import { useState, useEffect } from 'react';
import { Award, CheckCircle, Sparkles, Plus, X, User, Briefcase, PlusCircle, AlertCircle } from 'lucide-react';

interface ProfileData {
  full_name: string;
  goal_job: string;
  current_skills: string[];
}

interface UserCert {
  id: number;
  cert_id: number;
  status: string;
  name: string;
  provider: string;
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData>({
    full_name: '',
    goal_job: '',
    current_skills: [],
  });
  const [completedCerts, setCompletedCerts] = useState<UserCert[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Suggested popular skills list
  const POPULAR_SKILLS = [
    'Python', 'SQL', 'AWS', 'Docker', 'Kubernetes', 
    'React', 'Node.js', 'Azure', 'GCP', 'Machine Learning', 
    'Excel', 'Tableau', 'Power BI', 'SEO', 'Project Management'
  ];

  useEffect(() => {
    // 1. Fetch Profile Data
    const fetchProfile = fetch('/api/profile').then(res => {
      if (res.status === 401) {
        throw new Error('Unauthorized');
      }
      return res.json();
    });

    // 2. Fetch User Certifications
    const fetchCerts = fetch('/api/user-certifications').then(res => {
      if (res.status === 401) {
        throw new Error('Unauthorized');
      }
      return res.json();
    });

    Promise.all([fetchProfile, fetchCerts])
      .then(([profileResult, certsResult]) => {
        if (profileResult.error) {
          setError(profileResult.error);
        } else {
          setProfile({
            full_name: profileResult.full_name || '',
            goal_job: profileResult.goal_job || '',
            current_skills: profileResult.current_skills || [],
          });
        }

        if (Array.isArray(certsResult)) {
          const completed = certsResult.filter((c: any) => c.status === 'completed');
          setCompletedCerts(completed);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching profile details:', err);
        setError(err.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to load profile data');
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setError(null);

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setProfile({
          full_name: data.full_name,
          goal_job: data.goal_job,
          current_skills: data.current_skills,
        });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch {
      setError('Failed to save profile changes');
    } finally {
      setSaving(false);
    }
  };

  const addSkill = (skillName: string) => {
    const trimmed = skillName.trim();
    if (!trimmed) return;
    if (profile.current_skills.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      setNewSkill('');
      return;
    }
    setProfile(prev => ({
      ...prev,
      current_skills: [...prev.current_skills, trimmed]
    }));
    setNewSkill('');
  };

  const removeSkill = (skillToRemove: string) => {
    setProfile(prev => ({
      ...prev,
      current_skills: prev.current_skills.filter(s => s !== skillToRemove)
    }));
  };

  if (loading) {
    return (
      <div style={{
        maxWidth: 900,
        margin: '80px auto',
        padding: '0 24px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 16, color: 'var(--text-secondary)' }}>
          Loading your career profile...
        </div>
      </div>
    );
  }

  if (error === 'Unauthorized') {
    return (
      <div style={{
        maxWidth: 600,
        margin: '80px auto',
        padding: '40px 24px',
        textAlign: 'center',
        background: 'var(--bg-secondary)',
        borderRadius: 16,
        border: '1px solid var(--border)',
      }}>
        <User size={48} style={{ color: 'var(--accent)', marginBottom: 16 }} />
        <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
          Log In Required
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6, maxWidth: 460, margin: '0 auto 28px' }}>
          Please sign in to view and configure your career profile, track your matching skills, and target specific role types.
        </p>
        <a 
          href="/sign-in?redirect_url=/profile"
          style={{
            display: 'inline-block',
            padding: '12px 28px',
            background: 'var(--accent)',
            color: '#fff',
            borderRadius: 10,
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          Sign In
        </a>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: 900,
      margin: '0 auto',
      padding: '40px 24px',
    }}>
      {/* Header */}
      <div style={{
        marginBottom: 32,
        borderBottom: '1px solid var(--border)',
        paddingBottom: 24,
      }}>
        <h1 style={{
          fontSize: 32,
          fontWeight: 800,
          color: 'var(--text-primary)',
          letterSpacing: '-0.025em',
          marginBottom: 8,
        }}>
          Career Profile
        </h1>
        <p style={{
          fontSize: 15,
          color: 'var(--text-secondary)',
        }}>
          Manage your skills, target goal jobs, and view your verified certification credentials.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 32,
        alignItems: 'start',
      }}>
        {/* Profile Info Form */}
        <form onSubmit={handleSave} style={{
          background: 'var(--bg-secondary)',
          borderRadius: 16,
          border: '1px solid var(--border)',
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <User size={18} style={{ color: 'var(--accent)' }} /> Personal Details
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Full Name
            </label>
            <input 
              type="text"
              value={profile.full_name}
              onChange={e => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
              placeholder="e.g. Rahil Gandhi"
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--bg-primary, #0c0a09)',
                color: 'var(--text-primary)',
                fontSize: 14,
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Goal Job / Target Role
            </label>
            <input 
              type="text"
              value={profile.goal_job}
              onChange={e => setProfile(prev => ({ ...prev, goal_job: e.target.value }))}
              placeholder="e.g. Cloud Security Engineer"
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--bg-primary, #0c0a09)',
                color: 'var(--text-primary)',
                fontSize: 14,
                outline: 'none',
              }}
            />
          </div>

          {/* Save Button & Status Alerts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '12px',
                background: 'var(--accent)',
                color: '#fff',
                borderRadius: 8,
                border: 'none',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
                transition: 'opacity 0.2s',
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? 'Saving Profile...' : 'Save Profile Changes'}
            </button>

            {saveSuccess && (
              <span style={{ fontSize: 13, color: '#10b981', textAlign: 'center', fontWeight: 500 }}>
                ✓ Profile saved successfully!
              </span>
            )}
            {error && (
              <span style={{ fontSize: 13, color: '#ef4444', textAlign: 'center', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <AlertCircle size={14} /> {error}
              </span>
            )}
          </div>
        </form>

        {/* Skills Tag Management */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: 16,
            border: '1px solid var(--border)',
            padding: 24,
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={18} style={{ color: 'var(--accent)' }} /> My Skills
            </h2>

            {/* Input Form */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input 
                type="text"
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill(newSkill))}
                placeholder="Type a skill..."
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-primary, #0c0a09)',
                  color: 'var(--text-primary)',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => addSkill(newSkill)}
                style={{
                  background: 'var(--accent)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Active Skills Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {profile.current_skills.length === 0 ? (
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '4px 0' }}>
                  No skills added yet. Add skills to get accurate upskilling recommendations.
                </div>
              ) : (
                profile.current_skills.map((skill) => (
                  <span 
                    key={skill}
                    style={{
                      background: 'var(--accent-dim)',
                      color: 'var(--accent-light)',
                      fontSize: 12,
                      fontWeight: 600,
                      padding: '4px 10px',
                      borderRadius: 20,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    {skill}
                    <button 
                      type="button" 
                      onClick={() => removeSkill(skill)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-light)',
                        padding: 0,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Suggested Skills */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.05em' }}>
                Suggested Skills
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {POPULAR_SKILLS.filter(ps => !profile.current_skills.some(s => s.toLowerCase() === ps.toLowerCase())).map(skill => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => addSkill(skill)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border)',
                      borderRadius: 6,
                      padding: '4px 10px',
                      fontSize: 11,
                      fontWeight: 500,
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      transition: 'background 0.2s',
                    }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
                    onMouseOut={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                  >
                    <Plus size={10} /> {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Completed Certifications */}
      <div style={{
        marginTop: 32,
        background: 'var(--bg-secondary)',
        borderRadius: 16,
        border: '1px solid var(--border)',
        padding: 24,
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Award size={18} style={{ color: 'var(--accent)' }} /> Completed Certifications
        </h2>

        {completedCerts.length === 0 ? (
          <div style={{
            background: 'var(--bg-primary, #0c0a09)',
            borderRadius: 10,
            padding: 24,
            textAlign: 'center',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border)',
          }}>
            <p style={{ fontSize: 14, marginBottom: 12 }}>You haven't marked any certifications as completed yet.</p>
            <a 
              href="/certifications"
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--accent-light)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              Browse Certifications <PlusCircle size={14} />
            </a>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 16,
          }}>
            {completedCerts.map((c) => (
              <div 
                key={c.id}
                style={{
                  background: 'var(--bg-primary, #0c0a09)',
                  borderRadius: 12,
                  padding: 16,
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: 'rgba(16, 185, 129, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10b981',
                }}>
                  <CheckCircle size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                    {c.name}
                  </h4>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {c.provider}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
