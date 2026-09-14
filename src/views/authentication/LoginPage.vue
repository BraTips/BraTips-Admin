<script setup lang="ts">
import Logo from '@/layouts/dashboard/logo/LogoDark.vue';
import AuthLogin from './authForms/AuthLogin.vue';
</script>

<template>
  <main class="bratips-login">
    <section class="login-brand-panel">
      <div class="brand-top"><Logo /></div>
      <div class="brand-content">
        <span class="eyebrow">BRATIPS ADMIN</span>
        <h1>Smarter tips.<br /><span>Bigger wins.</span></h1>
        <p>Manage predictions, tipsters, live football data and platform analytics from one place.</p>
        <div class="brand-features">
          <div><strong>Live Football</strong><small>Real-time match data</small></div>
          <div><strong>Smart Odds</strong><small>Track and analyse odds</small></div>
          <div><strong>Expert Predictions</strong><small>Manage winning tips</small></div>
        </div>
      </div>
      <div class="brand-footer">© {{ new Date().getFullYear() }} BraTipsters</div>
    </section>

    <section class="login-form-panel">
      <div class="mobile-logo"><Logo /></div>
      <div class="login-card">
        <div class="login-heading">
          <span>ADMIN PORTAL</span>
          <h2>Welcome back</h2>
          <p>Sign in to continue to your BraTipsters dashboard.</p>
        </div>
        <AuthLogin />
        <div class="secure-note"><span class="secure-dot"></span> Secure administrator access</div>
      </div>
    </section>
  </main>
</template>

<style scoped lang="scss">
.bratips-login{min-height:100vh;display:grid;grid-template-columns:minmax(420px,46%) 1fr;background:#f7f8fb;color:#101a2e}
.login-brand-panel{position:relative;overflow:hidden;padding:42px 7vw 34px;background:radial-gradient(circle at 80% 25%,rgba(237,39,95,.25),transparent 30%),linear-gradient(145deg,#0a1223,#101a2e 58%,#151d31);color:#fff;display:flex;flex-direction:column}
.login-brand-panel:after{content:'';position:absolute;width:520px;height:520px;border:1px solid rgba(255,255,255,.07);border-radius:50%;right:-220px;bottom:-240px;box-shadow:0 0 0 80px rgba(255,255,255,.025),0 0 0 160px rgba(255,255,255,.018)}
.brand-top{position:relative;z-index:1}.brand-top :deep(.app-logo){max-width:175px}
.brand-content{position:relative;z-index:1;max-width:540px;margin:auto 0}.eyebrow{font-size:12px;font-weight:800;letter-spacing:.18em;color:#ff3b72}.brand-content h1{font-size:clamp(44px,5vw,72px);line-height:1.02;margin:18px 0;color:#fff;letter-spacing:-.04em}.brand-content h1 span{color:#ed275f}.brand-content p{max-width:470px;color:#b8c0d0;font-size:17px;line-height:1.7}.brand-features{display:grid;gap:18px;margin-top:38px}.brand-features div{padding-left:18px;border-left:2px solid #ed275f}.brand-features strong,.brand-features small{display:block}.brand-features small{color:#8994aa;margin-top:3px}.brand-footer{position:relative;z-index:1;color:#66738a;font-size:12px}
.login-form-panel{display:flex;align-items:center;justify-content:center;padding:40px}.login-card{width:min(100%,460px);background:#fff;border:1px solid #e8ebf1;border-radius:24px;padding:42px;box-shadow:0 24px 70px rgba(16,26,46,.10)}.login-heading>span{font-size:11px;font-weight:800;letter-spacing:.16em;color:#ed275f}.login-heading h2{font-size:34px;line-height:1.15;margin:10px 0 7px;letter-spacing:-.03em}.login-heading p{margin:0 0 30px;color:#758097}.secure-note{display:flex;justify-content:center;align-items:center;gap:8px;margin-top:24px;color:#8993a7;font-size:12px}.secure-dot{width:7px;height:7px;border-radius:50%;background:#27ae60}.mobile-logo{display:none;margin-bottom:28px}
@media(max-width:900px){.bratips-login{grid-template-columns:1fr}.login-brand-panel{display:none}.login-form-panel{padding:24px;min-height:100vh}.mobile-logo{display:block}.login-card{padding:32px 24px;border-radius:20px}.mobile-logo :deep(.app-logo){max-width:150px}}
</style>
