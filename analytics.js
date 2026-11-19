/* تحليلات الاستخدام عبر PostHog.
   - مفتاح المشروع (phc_...) مفتاح عام مصمّم للاستخدام داخل كود الموقع.
   - إذا كان المفتاح فاضي، ما يتم تحميل أي شيء ولا يُرسل أي حدث.
   - كل ما يُكتب في الحقول مخفي في تسجيل الجلسات، ولا يتم ربط الأحداث باسم أو جوال. */
(function () {
  var POSTHOG_KEY = 'phc_oEpZxyuEBY4zgeA7aCUQr8sZuYGbhBTTUS5EL7Jagqxc';
  var POSTHOG_HOST = 'https://us.i.posthog.com';

  window.sanadTrack = function () {};
  if (!POSTHOG_KEY) return;
  if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) return; // لا نرسل أحداث التجربة المحلية

  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);

  window.posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: 'identified_only', // زوار مجهولون، بدون ملفات أشخاص
    capture_pageview: false,            // الشاشات تُسجَّل يدويًا من app.js لأن التنقل يعتمد على #
    capture_pageleave: true,
    autocapture: true,
    session_recording: { maskAllInputs: true },
  });

  // يُستدعى من track() في app.js
  window.sanadTrack = function (ev) {
    if (ev.indexOf('view:') === 0) {
      window.posthog.capture('$pageview', { screen: ev.slice(5) });
    } else {
      window.posthog.capture(ev);
    }
  };
})();
