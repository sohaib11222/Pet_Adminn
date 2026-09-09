import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../Sidebar'
import Header from '../Header'
import { apiRequest, getCurrentUser } from '../../api/client'

const SettingsChangePassword = () => {
  const currentUser = useMemo(() => getCurrentUser(), [])
  const email = currentUser?.email || 'your registered email address'
  const [step, setStep] = useState('request')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const clearMessages = () => {
    setError('')
    setSuccess('')
  }

  const requestCode = async () => {
    clearMessages()
    setLoading(true)
    try {
      await apiRequest('/auth/change-password/request-code', { method: 'POST' })
      setStep('verify')
      setSuccess(`A verification code has been sent to ${email}.`)
    } catch (requestError) {
      setError(requestError?.message || 'Unable to send the verification code.')
    } finally {
      setLoading(false)
    }
  }

  const verifyCode = async (event) => {
    event.preventDefault()
    clearMessages()
    const normalizedCode = code.trim()
    if (!/^\d{6}$/.test(normalizedCode)) {
      setError('Enter the 6-digit verification code from your email.')
      return
    }

    setLoading(true)
    try {
      await apiRequest('/auth/change-password/verify-code', {
        method: 'POST',
        body: { code: normalizedCode },
      })
      setStep('password')
      setSuccess('Code verified. You can now set your new password.')
    } catch (verifyError) {
      setError(verifyError?.message || 'The verification code is invalid or expired.')
    } finally {
      setLoading(false)
    }
  }

  const savePassword = async (event) => {
    event.preventDefault()
    clearMessages()
    if (newPassword.length < 8) {
      setError('The new password must be at least 8 characters long.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('The new password and confirmation do not match.')
      return
    }

    setLoading(true)
    try {
      await apiRequest('/auth/change-password', {
        method: 'POST',
        body: { code: code.trim(), newPassword },
      })
      setStep('request')
      setCode('')
      setNewPassword('')
      setConfirmPassword('')
      setSuccess('Your password has been changed successfully.')
    } catch (saveError) {
      setError(saveError?.message || 'Unable to change the password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Header />
      <Sidebar />
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header">
            <ul className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
              <li className="breadcrumb-item active">Change Password</li>
            </ul>
          </div>

          <div className="row">
            <div className="col-lg-8 col-xl-7">
              <div className="card">
                <div className="card-body">
                  <h4 className="page-title mb-2">Change Password</h4>
                  <p className="text-muted mb-4">Verify your registered email before creating a new Admin password.</p>

                  {error && <div className="alert alert-danger" role="alert">{error}</div>}
                  {success && <div className="alert alert-success" role="status">{success}</div>}

                  <div className="d-flex flex-wrap gap-2 mb-4">
                    <span className={`badge ${step === 'request' ? 'bg-primary' : 'bg-light text-dark'}`}>1. Request code</span>
                    <span className={`badge ${step === 'verify' ? 'bg-primary' : 'bg-light text-dark'}`}>2. Verify email</span>
                    <span className={`badge ${step === 'password' ? 'bg-primary' : 'bg-light text-dark'}`}>3. New password</span>
                  </div>

                  {step === 'request' && (
                    <div>
                      <p className="mb-3">A verification code will be sent to <strong>{email}</strong> only when you click the button below.</p>
                      <button type="button" className="btn btn-primary" onClick={requestCode} disabled={loading}>
                        {loading ? 'Sending…' : 'Send Verification Code'}
                      </button>
                    </div>
                  )}

                  {step === 'verify' && (
                    <form onSubmit={verifyCode}>
                      <div className="form-group local-forms mb-3">
                        <label htmlFor="admin-password-code">Verification code <span className="login-danger">*</span></label>
                        <input id="admin-password-code" className="form-control" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Enter the 6-digit code" />
                      </div>
                      <div className="d-flex flex-wrap gap-2">
                        <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Verifying…' : 'Verify Code'}</button>
                        <button type="button" className="btn btn-light" onClick={requestCode} disabled={loading}>{loading ? 'Sending…' : 'Resend Code'}</button>
                      </div>
                    </form>
                  )}

                  {step === 'password' && (
                    <form onSubmit={savePassword}>
                      <div className="form-group local-forms mb-3">
                        <label htmlFor="admin-new-password">New password <span className="login-danger">*</span></label>
                        <input id="admin-new-password" className="form-control" type="password" autoComplete="new-password" minLength={8} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
                      </div>
                      <div className="form-group local-forms mb-3">
                        <label htmlFor="admin-confirm-password">Confirm new password <span className="login-danger">*</span></label>
                        <input id="admin-confirm-password" className="form-control" type="password" autoComplete="new-password" minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
                      </div>
                      <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Saving…' : 'Change Password'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsChangePassword
