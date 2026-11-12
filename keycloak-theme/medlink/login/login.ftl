<#import "template.ftl" as layout>
<#import "social-providers.ftl" as identityProviders>
<#import "passkeys.ftl" as passkeys>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('username','password') displayInfo=realm.password && (properties.signupUrl?has_content || (realm.registrationAllowed && !registrationDisabled??)); section>
<!-- template: login.ftl (MedLink) -->

    <#if section = "preHeader">
        <#-- Onglets Patient / Praticien (affichage : voir js/medlink.js) -->
        <div class="ml-tabs" role="tablist">
            <button type="button" role="tab" class="ml-tab is-active" aria-selected="true" data-ml-tab="patient"><@layout.ico paths='<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>' /> ${msg("tabPatient")}</button>
            <button type="button" role="tab" class="ml-tab" aria-selected="false" data-ml-tab="practitioner"><@layout.ico paths='<path d="M10 2v7.5L4.5 19a2 2 0 0 0 1.7 3h11.6a2 2 0 0 0 1.7-3L14 9.5V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/>' /> ${msg("tabPractitioner")}</button>
        </div>
    <#elseif section = "header">
        ${msg("loginAccountTitle")}
    <#elseif section = "form">
        <div id="kc-form">
          <p class="ml-subtitle">${msg("loginSubtitle")}</p>
          <div id="kc-form-wrapper">
            <#if realm.password>
                <form id="kc-form-login" class="ml-form" onsubmit="login.disabled = true; return true;" action="${url.loginAction}" method="post" novalidate="novalidate">
                    <#assign errorText = messagesPerField.getFirstError('username','password')>
                    <#if !usernameHidden??>
                        <div class="ml-field">
                            <label for="username" class="ml-label"><#if !realm.loginWithEmailAllowed>${msg("username")}<#elseif !realm.registrationEmailAsUsername>${msg("usernameOrEmail")}<#else>${msg("email")}</#if></label>
                            <span class="ml-input<#if errorText?has_content> ml-input--error</#if>">
                                <@layout.ico paths='<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>' size=20 />
                                <input id="username" name="username" value="${login.username!''}" type="text" autofocus autocomplete="${(enableWebAuthnConditionalUI?has_content)?then('username webauthn', 'username')}" aria-invalid="<#if errorText?has_content>true</#if>" />
                            </span>
                        </div>
                    </#if>

                    <div class="ml-field">
                        <div class="ml-label-row">
                            <label for="password" class="ml-label">${msg("password")}</label>
                            <#if realm.resetPasswordAllowed>
                                <a class="ml-forgot" href="${url.loginResetCredentialsUrl}">${msg("doForgotPassword")}</a>
                            </#if>
                        </div>
                        <span class="ml-input<#if errorText?has_content> ml-input--error</#if>">
                            <@layout.ico paths='<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>' size=20 />
                            <input id="password" name="password" type="password" <#if usernameHidden??>autofocus</#if> autocomplete="current-password" aria-invalid="<#if errorText?has_content>true</#if>" />
                            <button class="ml-eye" type="button" aria-label="${msg('showPassword')}"
                                    aria-controls="password" data-password-toggle
                                    data-icon-show="${properties.kcFormPasswordVisibilityIconShow}" data-icon-hide="${properties.kcFormPasswordVisibilityIconHide}"
                                    data-label-show="${msg('showPassword')}" data-label-hide="${msg('hidePassword')}" id="password-show-password">
                                <i class="${properties.kcFormPasswordVisibilityIconShow}" aria-hidden="true"></i>
                            </button>
                        </span>
                        <#if errorText?has_content>
                            <div class="ml-error" id="input-error" aria-live="polite">${errorText}</div>
                        </#if>
                    </div>

                    <div class="ml-row">
                        <#if realm.rememberMe && !usernameHidden??>
                            <label class="ml-check" for="rememberMe">
                                <input type="checkbox" id="rememberMe" name="rememberMe" <#if login.rememberMe??>checked</#if> />
                                <span>${msg("rememberMe")}</span>
                            </label>
                        <#else>
                            <span></span>
                        </#if>
                        <span class="ml-ssl"><@layout.ico paths='<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>' size=13 /></span>
                    </div>

                    <input type="hidden" id="id-hidden-input" name="credentialId" <#if auth.selectedCredential?has_content>value="${auth.selectedCredential}"</#if>/>
                    <button class="ml-btn" name="login" id="kc-login" type="submit">${msg("doLogIn")} <@layout.ico paths='<path d="M5 12h14M13 6l6 6-6 6"/>' size=18 /></button>
                </form>
            </#if>
            </div>
        </div>
        <@passkeys.conditionalUIData />
    <#elseif section = "socialProviders" >
        <#if realm.password && social.providers?? && social.providers?has_content>
            <@identityProviders.show social=social/>
        </#if>
    <#elseif section = "info" >
        <#if realm.password && properties.signupUrl?has_content>
            <#-- MedLink : l'inscription se fait sur le site (formulaire patient), pas dans Keycloak -->
            <div id="kc-registration-container">
                <div id="kc-registration">
                    <span data-ml-patient>${msg("noAccount")} <a href="${properties.signupUrl}">${msg("doRegister")}</a></span>
                    <span data-ml-practitioner hidden>${msg("noAccount")} <a href="${properties.practitionerSignupUrl!properties.signupUrl}">${msg("doRegisterPractitioner")}</a></span>
                </div>
            </div>
        <#elseif realm.password && realm.registrationAllowed && !registrationDisabled??>
            <div id="kc-registration-container">
                <div id="kc-registration">
                    <span>${msg("noAccount")} <a href="${url.registrationUrl}">${msg("doRegister")}</a></span>
                </div>
            </div>
        </#if>
        <div class="ml-note">
            <span class="ml-note__icon"><@layout.ico paths='<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/>' size=16 /></span>
            <p>${msg("networkNote")}</p>
        </div>
    </#if>

</@layout.registrationLayout>
