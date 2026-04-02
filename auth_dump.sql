--
-- PostgreSQL database dump
--

\restrict Fb15W0rHddN0AGh0YsmPFUxwUPF82AyUHi8XdRaxZVpA6W6wQ9EIfgP2F5XhLBT

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.3 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
\.


--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.custom_oauth_providers (id, provider_type, identifier, name, client_id, client_secret, acceptable_client_ids, scopes, pkce_enabled, attribute_mapping, authorization_params, enabled, email_optional, issuer, discovery_url, skip_nonce_check, cached_discovery, discovery_cached_at, authorization_url, token_url, userinfo_url, jwks_uri, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at, invite_token, referrer, oauth_client_state_id, linking_target_id, email_optional) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
00000000-0000-0000-0000-000000000000	165933d3-e8c0-45d5-818a-f348a4041bd3	authenticated	authenticated	ainun01@mentorhipers.local	$2a$10$jCR3p/NHSvd.NlfoGFVJiOtj42PWdwZyGusvOncIvRPWvER4zkNwu	2026-03-29 05:18:44.982246+00	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-03-29 05:18:44.980059+00	2026-03-29 05:23:31.424224+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	8bc43a7a-c98b-42c5-91ee-1e421c2aaf92	authenticated	authenticated	askadibalik@mentorhipers.local	$2a$10$.UefMV6z3bsL8CAIbSEF9.Jtoi6aKQS.M5MAozcdSx7aQovCJem5m	2026-03-29 05:18:44.844261+00	\N		\N		\N			\N	2026-03-29 12:19:31.617328+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-03-29 05:18:44.84145+00	2026-04-02 14:00:51.206937+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	96ae0d10-51f5-4fda-a5c0-1a778a9ab46e	authenticated	authenticated	astridds19@mentorhipers.local	$2a$10$gbYZtaM/YHorgWH7C0sj5OQ1KzzJq27gdSesNW.FDfsRtwGWYJ8Zu	2026-03-29 05:18:43.905394+00	\N		\N		\N			\N	2026-04-01 12:36:02.511577+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-03-29 05:18:43.902636+00	2026-04-02 15:05:33.334452+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	7d6ae7c5-e990-4f6d-839f-73495d65ca55	authenticated	authenticated	sarbil_bila@mentorhipers.local	$2a$10$4OE8wrQPsIQuxtQOe5NyxestnE87dfMLCxjIsG/P.z4Xw7rm.yT4a	2026-03-29 05:18:42.967334+00	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-03-29 05:18:42.963963+00	2026-03-29 05:23:33.404548+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	9e557ae3-2517-43c7-80df-2700ec910ec5	authenticated	authenticated	dewisuryani@mentorhipers.local	$2a$10$Kc/wuZlOrUFUVxL05dL4lO9VXJVMnX4Z1vQCS3H4xD2ROddXrOtsC	2026-03-29 05:18:44.041001+00	\N		\N		\N			\N	2026-04-02 14:26:17.440396+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-03-29 05:18:44.038861+00	2026-04-02 14:26:17.485377+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	03ab5ebc-36bf-4cf6-948c-4f86ffdbbde3	authenticated	authenticated	aldinisalma@mentorhipers.local	$2a$10$LajgCJs9YFHtZbFWZvPhcuNA0PaUAvx768ipcBzhtL/du11OyfT3.	2026-03-29 05:18:44.580936+00	\N		\N		\N			\N	2026-03-31 16:19:18.871639+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-03-29 05:18:44.577985+00	2026-03-31 16:19:18.899285+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	f3c27e4e-db1a-478b-8f9f-f0e9fa742356	authenticated	authenticated	ihsanaura@mentorhipers.local	$2a$10$tWKxSJIsEwcP4pFLq5sTtuPz0b7qAkiu671Y913JeqmVVAxPNrgNy	2026-03-29 05:18:43.368198+00	\N		\N		\N			\N	2026-04-02 15:30:08.24828+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-03-29 05:18:43.365395+00	2026-04-02 15:30:08.30284+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	e6cc8572-9783-42bc-94bd-bdc32ccfbac8	authenticated	authenticated	millaty@mentorhipers.local	$2a$10$U90VRM2LAiJkmvvpPIleNOah0d8X73BoL8CHnqzs1K.YHQ9QRzONO	2026-03-29 05:18:44.180807+00	\N		\N		\N			\N	2026-03-31 10:24:44.215967+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-03-29 05:18:44.17868+00	2026-03-31 10:24:44.251593+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	59528fbf-7da5-4b93-ac63-578c212f9849	authenticated	authenticated	miajabeen@mentorhipers.local	$2a$10$3ajRXuezb.8ZJxAuO.JlJ.7bBkzva.CoAuQ/l0bh0InL1ODG9rsPa	2026-03-29 05:18:44.446952+00	\N		\N		\N			\N	2026-03-29 13:22:15.296042+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-03-29 05:18:44.444579+00	2026-04-01 21:07:36.839242+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	ca5b9250-5867-4adf-a23b-120eec075fd0	authenticated	authenticated	baitulquran@mentorhipers.local	$2a$10$HP9lkcwHJVZR2HlKHRhXbefNEy/NCJGuEHdcjYpuxRe74eIp1b0Pu	2026-03-29 05:18:43.234908+00	\N		\N		\N			\N	2026-03-30 13:48:22.549511+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-03-29 05:18:43.232223+00	2026-04-02 04:25:48.918841+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	dcdd1ff2-fc86-4a07-9d88-74e8c21c8be2	authenticated	authenticated	shintanastiti@mentorhipers.local	$2a$10$Q8PBL7EpbZKvwaYiqCmLVuyw0nVOaw1O6DM01/OSDvL8Cy9MXZoxu	2026-03-29 05:18:44.713971+00	\N		\N		\N			\N	2026-03-30 01:49:16.315995+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-03-29 05:18:44.71179+00	2026-04-01 11:53:08.955941+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	12089ea2-7925-4209-ba3a-d6b0976079b9	authenticated	authenticated	chintia.hermana@mentorhipers.local	$2a$10$LHFU8Jyp9mFlh/uGImoDIeEBrwsXhkDmUq96qjkoyMqnumzJZICai	2026-03-29 05:18:42.680747+00	\N		\N		\N			\N	2026-04-01 02:44:28.875558+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-03-29 05:18:42.6756+00	2026-04-01 16:18:52.78174+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	7f569eac-1fb2-4c5a-9074-ca5fa50d3724	authenticated	authenticated	iksangopal03@mentorhipers.local	$2a$10$fcgMMHaO6G6xGeQvZaVibey1FjVoY1j/gqlNh/5p4mAPcTbOSDDSS	2026-03-29 05:18:42.192159+00	\N		\N		\N			\N	2026-04-01 01:41:16.1727+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-03-29 05:18:42.18895+00	2026-04-01 03:24:05.726061+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	afc33010-fcb8-4cf4-a75b-23bbb096f014	authenticated	authenticated	larsfhns@mentorhipers.local	$2a$10$zJ4F60smfPCDdU9QfA5RpeU40FxydE2Q0k8tlsYzPciFjBkM95BZe	2026-03-29 05:18:42.828879+00	\N		\N		\N			\N	2026-03-29 13:23:35.013336+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-03-29 05:18:42.825752+00	2026-03-31 02:30:23.216752+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	17640674-04f2-4b1c-b065-4b56a68e595b	authenticated	authenticated	nadhira@mentorhipers.local	$2a$10$YoA3/iAn4Sy5RJJo2.IOReBkWwTapcTL4ixtznItZ9xgGfmi1wW.O	2026-03-29 05:18:44.31486+00	\N		\N		\N			\N	2026-04-02 15:08:17.908777+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-03-29 05:18:44.311777+00	2026-04-02 15:08:17.919766+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	b6d69be7-f77a-4873-bd82-425ca563d6f1	authenticated	authenticated	alfinz4712@mentorhipers.local	$2a$10$/4Ifu59UFE3BXYBlz/lfveW8WdMEY0IlCaJAfX1Mp4Z.mgI5NVeSq	2026-03-29 05:18:43.635721+00	\N		\N		\N			\N	2026-04-02 15:01:55.60382+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-03-29 05:18:43.633485+00	2026-04-02 15:01:55.682565+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	f80c971a-5a82-4ced-83fb-1ee295a252b3	authenticated	authenticated	jeffreyrahardjo@mentorhipers.local	$2a$10$WLxB4G1hjmYj9P3lYUB1f.15mUtRkuFm8RgLQHckYzAZPWvQAjOBS	2026-03-29 05:18:42.347829+00	\N		\N		\N			\N	2026-04-02 15:15:08.512454+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-03-29 05:18:42.339766+00	2026-04-02 15:15:08.570994+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	237593b0-b857-4f0e-81fc-448f838e3ba6	authenticated	authenticated	meetnurul@mentorhipers.local	$2a$10$RUgLYuXUlaY5W/NwPD9kuuroSiMPF5Ue/NMn.5Nh.LrKbSzh8Rkly	2026-03-29 05:18:43.503403+00	\N		\N		\N			\N	2026-04-02 15:04:30.669048+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-03-29 05:18:43.500172+00	2026-04-02 15:04:30.678732+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	4e949fa0-c160-4a4c-8e5b-dcb87426fddb	authenticated	authenticated	abdulhamiid@mentorhipers.local	$2a$10$FdYdf9pISoVigRom382i2OAq24Hk8M6bBCYlCKvYUW87M6wpJBvr6	2026-03-29 05:18:43.77174+00	\N		\N		\N			\N	2026-03-30 07:54:19.863987+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-03-29 05:18:43.769287+00	2026-04-02 15:31:04.885612+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	70f406c8-985c-4b16-af6d-68481e60bf32	authenticated	authenticated	dinurpradipta@mentorhipers.local	$2a$10$2Am4lTbqRHNptkZDmcpr5u18vVjGSgHxOsxovQxr/mDh.3wvxlz1i	2026-03-29 05:18:42.02416+00	\N		\N		\N			\N	2026-03-29 07:34:03.607242+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-03-29 05:18:42.001908+00	2026-04-02 07:55:27.804522+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	5240aafe-ff7c-4038-9970-4563f64928ec	authenticated	authenticated	mei01@mentorhipers.local	$2a$10$Ss9vFfPUDHiC.W5BcyINeekgCzVt8ZHqWTRhHd2RYoMvlvpHN.Zxy	2026-03-29 05:18:43.100467+00	\N		\N		\N			\N	2026-04-01 14:13:20.834026+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-03-29 05:18:43.098197+00	2026-04-01 14:13:20.887542+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	49f749b7-6973-463f-a122-22748aa7da8f	authenticated	authenticated	radiakbarr@mentorhipers.local	$2a$10$rohoSsULVvnJ6HFmompbBOOu/8/pVFrjRIxv3xusnIXEH5Q0CpRC.	2026-03-29 05:18:45.124642+00	\N		\N		\N			\N	2026-03-29 12:18:29.591919+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-03-29 05:18:45.117125+00	2026-04-02 06:27:52.53391+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	8bc0bda5-b788-476e-9966-31206b9fb38d	authenticated	authenticated	habibbah@mentorhipers.local	$2a$10$7j6X2shXaPorQqwSpKDSx.HTmel/1azJUxxwE1xuVtxmVK6fTnwjq	2026-04-02 08:24:51.068128+00	\N		\N		\N			\N	2026-04-02 15:08:13.413997+00	{"provider": "email", "providers": ["email"]}	{"username": "habibbah", "full_name": "Habibbah Nur Esa", "display_name": "Habibbah Nur Esa", "email_verified": true}	\N	2026-04-02 08:24:51.004135+00	2026-04-02 15:08:13.477778+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	dcbce075-1474-4774-8d5f-a954af2d525a	authenticated	authenticated	lifein.nayanika@gmail.com	$2a$10$B0fU6vAvbEQJaR401Ua4AOEABMwaFCnNUFBmnv/SUZksszUIG3CJW	2026-03-29 05:18:45.807536+00	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-03-29 05:18:45.801983+00	2026-03-29 05:23:30.586853+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	03c2a3c3-197e-45a0-a67d-95fc4288d21b	authenticated	authenticated	arunika@mentorhipers.local	$2a$06$iEHAkCDMLnwgzfvyeAKGxu.BIQe6Fxc5tlM/p5KLTjP9nuhNKHJAu	2026-03-29 07:10:10.392168+00	\N		\N		2026-03-29 07:10:10.392168+00			\N	2026-04-02 15:05:45.041774+00	{"provider": "email", "providers": ["email"]}	{"username": "arunika", "full_name": "Admin Arunika", "display_name": "Admin Arunika"}	\N	2026-03-29 07:10:10.392168+00	2026-04-02 16:05:58.200927+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	6ad9103e-4a03-48aa-9e78-3d3d20a21c00	authenticated	authenticated	allisha@mentorhipers.local	$2a$10$f4Xe1kcVgrtRHUjQ2BMVleoI1Z8H9bJpc9AXbhJaO/CCK8TiHnGVC	2026-03-29 05:18:45.664567+00	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-03-29 05:18:45.661577+00	2026-03-29 05:23:30.724781+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	161c689a-0a78-4be2-8c77-157d18276954	authenticated	authenticated	fathyaa@mentorhipers.local	$2a$10$W4RJjlu7BbwRsel/qfdEVeCDUI6rooqNlegFXsDnw3upOH65UcbLW	2026-03-29 05:18:45.533662+00	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-03-29 05:18:45.531438+00	2026-03-29 05:23:30.860694+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	2643c4ad-992b-4ad0-a325-df9ccc7f91f6	authenticated	authenticated	shinyinterior@mentorhipers.local	$2a$10$2OznnAaNSXVu8.J6zD1sI.YsdwODV0XU.LgckWPsoDP3k8wjuGLVO	2026-04-02 08:16:15.426882+00	\N		\N		\N			\N	2026-04-02 12:15:51.210539+00	{"provider": "email", "providers": ["email"]}	{"username": "shinyinterior", "full_name": "Habibbah Nur Esa", "display_name": "Habibbah Nur Esa", "email_verified": true}	\N	2026-04-02 08:16:15.206251+00	2026-04-02 16:05:58.201399+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	415bf887-40f4-464e-b7bd-20de942bedda	authenticated	authenticated	admin@mentorhipers.local	$2a$10$6lKKMdcL8E/8Aog9OGalPuRk.xeb.YyiAYZtj5xVINBzl.DFdLd3.	2026-03-29 05:18:45.394868+00	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-03-29 05:18:45.391911+00	2026-03-29 05:23:31.000661+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	b96b7653-26a3-4cb4-a17a-4eebbad1342d	authenticated	authenticated	fthyaa@mentorhipers.local	$2a$10$/QRuyCjJOW65HNZilxSAT.BX5LWoznQWCO7UlMygvyoc0Cr8g/JJm	2026-03-29 05:18:45.263364+00	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-03-29 05:18:45.261164+00	2026-03-29 05:23:31.135194+00	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
70f406c8-985c-4b16-af6d-68481e60bf32	70f406c8-985c-4b16-af6d-68481e60bf32	{"sub": "70f406c8-985c-4b16-af6d-68481e60bf32", "email": "dinurpradipta@mentorhipers.local", "email_verified": false, "phone_verified": false}	email	2026-03-29 05:18:42.013366+00	2026-03-29 05:18:42.013433+00	2026-03-29 05:18:42.013433+00	05fe7471-9918-4682-ad1b-ac62532b6f60
7f569eac-1fb2-4c5a-9074-ca5fa50d3724	7f569eac-1fb2-4c5a-9074-ca5fa50d3724	{"sub": "7f569eac-1fb2-4c5a-9074-ca5fa50d3724", "email": "iksangopal03@mentorhipers.local", "email_verified": false, "phone_verified": false}	email	2026-03-29 05:18:42.190678+00	2026-03-29 05:18:42.190736+00	2026-03-29 05:18:42.190736+00	6d2e8935-7cb9-4850-a507-4e1c1ac32579
f80c971a-5a82-4ced-83fb-1ee295a252b3	f80c971a-5a82-4ced-83fb-1ee295a252b3	{"sub": "f80c971a-5a82-4ced-83fb-1ee295a252b3", "email": "jeffreyrahardjo@mentorhipers.local", "email_verified": false, "phone_verified": false}	email	2026-03-29 05:18:42.344825+00	2026-03-29 05:18:42.344902+00	2026-03-29 05:18:42.344902+00	14ec9e09-10e5-4575-b752-085002771236
12089ea2-7925-4209-ba3a-d6b0976079b9	12089ea2-7925-4209-ba3a-d6b0976079b9	{"sub": "12089ea2-7925-4209-ba3a-d6b0976079b9", "email": "chintia.hermana@mentorhipers.local", "email_verified": false, "phone_verified": false}	email	2026-03-29 05:18:42.677967+00	2026-03-29 05:18:42.678013+00	2026-03-29 05:18:42.678013+00	7fa1392c-3f39-46db-b43b-e1b7dabde0a0
afc33010-fcb8-4cf4-a75b-23bbb096f014	afc33010-fcb8-4cf4-a75b-23bbb096f014	{"sub": "afc33010-fcb8-4cf4-a75b-23bbb096f014", "email": "larsfhns@mentorhipers.local", "email_verified": false, "phone_verified": false}	email	2026-03-29 05:18:42.826776+00	2026-03-29 05:18:42.826836+00	2026-03-29 05:18:42.826836+00	d2e241fb-b73e-4a9d-8bd5-846eb26e7846
7d6ae7c5-e990-4f6d-839f-73495d65ca55	7d6ae7c5-e990-4f6d-839f-73495d65ca55	{"sub": "7d6ae7c5-e990-4f6d-839f-73495d65ca55", "email": "sarbil_bila@mentorhipers.local", "email_verified": false, "phone_verified": false}	email	2026-03-29 05:18:42.965012+00	2026-03-29 05:18:42.965057+00	2026-03-29 05:18:42.965057+00	d83cc30f-e20a-4ae5-997b-06f3508646b2
5240aafe-ff7c-4038-9970-4563f64928ec	5240aafe-ff7c-4038-9970-4563f64928ec	{"sub": "5240aafe-ff7c-4038-9970-4563f64928ec", "email": "mei01@mentorhipers.local", "email_verified": false, "phone_verified": false}	email	2026-03-29 05:18:43.099266+00	2026-03-29 05:18:43.099316+00	2026-03-29 05:18:43.099316+00	5d240134-90bc-49f6-9f4a-9bf3b0d2c76f
ca5b9250-5867-4adf-a23b-120eec075fd0	ca5b9250-5867-4adf-a23b-120eec075fd0	{"sub": "ca5b9250-5867-4adf-a23b-120eec075fd0", "email": "baitulquran@mentorhipers.local", "email_verified": false, "phone_verified": false}	email	2026-03-29 05:18:43.233289+00	2026-03-29 05:18:43.233335+00	2026-03-29 05:18:43.233335+00	2ada8876-9571-4a3c-86f8-18b15a6a5eb3
f3c27e4e-db1a-478b-8f9f-f0e9fa742356	f3c27e4e-db1a-478b-8f9f-f0e9fa742356	{"sub": "f3c27e4e-db1a-478b-8f9f-f0e9fa742356", "email": "ihsanaura@mentorhipers.local", "email_verified": false, "phone_verified": false}	email	2026-03-29 05:18:43.366455+00	2026-03-29 05:18:43.366555+00	2026-03-29 05:18:43.366555+00	cf3eef95-fa17-46e8-b542-4edc7898edab
237593b0-b857-4f0e-81fc-448f838e3ba6	237593b0-b857-4f0e-81fc-448f838e3ba6	{"sub": "237593b0-b857-4f0e-81fc-448f838e3ba6", "email": "meetnurul@mentorhipers.local", "email_verified": false, "phone_verified": false}	email	2026-03-29 05:18:43.501191+00	2026-03-29 05:18:43.501235+00	2026-03-29 05:18:43.501235+00	05fa73dc-2470-4309-b091-dc91dcb72dc5
b6d69be7-f77a-4873-bd82-425ca563d6f1	b6d69be7-f77a-4873-bd82-425ca563d6f1	{"sub": "b6d69be7-f77a-4873-bd82-425ca563d6f1", "email": "alfinz4712@mentorhipers.local", "email_verified": false, "phone_verified": false}	email	2026-03-29 05:18:43.634525+00	2026-03-29 05:18:43.634568+00	2026-03-29 05:18:43.634568+00	0e476534-60e7-47e1-a932-dddeeda123d2
4e949fa0-c160-4a4c-8e5b-dcb87426fddb	4e949fa0-c160-4a4c-8e5b-dcb87426fddb	{"sub": "4e949fa0-c160-4a4c-8e5b-dcb87426fddb", "email": "abdulhamiid@mentorhipers.local", "email_verified": false, "phone_verified": false}	email	2026-03-29 05:18:43.770291+00	2026-03-29 05:18:43.770338+00	2026-03-29 05:18:43.770338+00	5d6fe2b5-1e56-4589-a285-f5d50bf6206f
96ae0d10-51f5-4fda-a5c0-1a778a9ab46e	96ae0d10-51f5-4fda-a5c0-1a778a9ab46e	{"sub": "96ae0d10-51f5-4fda-a5c0-1a778a9ab46e", "email": "astridds19@mentorhipers.local", "email_verified": false, "phone_verified": false}	email	2026-03-29 05:18:43.903641+00	2026-03-29 05:18:43.903686+00	2026-03-29 05:18:43.903686+00	f375534a-434c-45d4-867c-24ca93519ce4
9e557ae3-2517-43c7-80df-2700ec910ec5	9e557ae3-2517-43c7-80df-2700ec910ec5	{"sub": "9e557ae3-2517-43c7-80df-2700ec910ec5", "email": "dewisuryani@mentorhipers.local", "email_verified": false, "phone_verified": false}	email	2026-03-29 05:18:44.039853+00	2026-03-29 05:18:44.039902+00	2026-03-29 05:18:44.039902+00	c84d6395-a88a-43f9-8444-2bf72cb05604
e6cc8572-9783-42bc-94bd-bdc32ccfbac8	e6cc8572-9783-42bc-94bd-bdc32ccfbac8	{"sub": "e6cc8572-9783-42bc-94bd-bdc32ccfbac8", "email": "millaty@mentorhipers.local", "email_verified": false, "phone_verified": false}	email	2026-03-29 05:18:44.179672+00	2026-03-29 05:18:44.179727+00	2026-03-29 05:18:44.179727+00	ccca9db8-fc8d-4ee4-a0c5-a99b31b30040
17640674-04f2-4b1c-b065-4b56a68e595b	17640674-04f2-4b1c-b065-4b56a68e595b	{"sub": "17640674-04f2-4b1c-b065-4b56a68e595b", "email": "nadhira@mentorhipers.local", "email_verified": false, "phone_verified": false}	email	2026-03-29 05:18:44.312773+00	2026-03-29 05:18:44.312819+00	2026-03-29 05:18:44.312819+00	0443edb1-465c-42ef-b13b-fd02052b8484
59528fbf-7da5-4b93-ac63-578c212f9849	59528fbf-7da5-4b93-ac63-578c212f9849	{"sub": "59528fbf-7da5-4b93-ac63-578c212f9849", "email": "miajabeen@mentorhipers.local", "email_verified": false, "phone_verified": false}	email	2026-03-29 05:18:44.445593+00	2026-03-29 05:18:44.445641+00	2026-03-29 05:18:44.445641+00	0c7d19da-8660-4640-b68b-ac550fb96638
03ab5ebc-36bf-4cf6-948c-4f86ffdbbde3	03ab5ebc-36bf-4cf6-948c-4f86ffdbbde3	{"sub": "03ab5ebc-36bf-4cf6-948c-4f86ffdbbde3", "email": "aldinisalma@mentorhipers.local", "email_verified": false, "phone_verified": false}	email	2026-03-29 05:18:44.578992+00	2026-03-29 05:18:44.579036+00	2026-03-29 05:18:44.579036+00	289fcb79-6fd0-4c5d-9647-06523a22a6ee
dcdd1ff2-fc86-4a07-9d88-74e8c21c8be2	dcdd1ff2-fc86-4a07-9d88-74e8c21c8be2	{"sub": "dcdd1ff2-fc86-4a07-9d88-74e8c21c8be2", "email": "shintanastiti@mentorhipers.local", "email_verified": false, "phone_verified": false}	email	2026-03-29 05:18:44.712785+00	2026-03-29 05:18:44.71283+00	2026-03-29 05:18:44.71283+00	0fc56fe7-812c-4bae-a9d5-a431855677e9
8bc43a7a-c98b-42c5-91ee-1e421c2aaf92	8bc43a7a-c98b-42c5-91ee-1e421c2aaf92	{"sub": "8bc43a7a-c98b-42c5-91ee-1e421c2aaf92", "email": "askadibalik@mentorhipers.local", "email_verified": false, "phone_verified": false}	email	2026-03-29 05:18:44.842439+00	2026-03-29 05:18:44.842487+00	2026-03-29 05:18:44.842487+00	b1eab020-42fa-419e-85c0-a97f28a48658
165933d3-e8c0-45d5-818a-f348a4041bd3	165933d3-e8c0-45d5-818a-f348a4041bd3	{"sub": "165933d3-e8c0-45d5-818a-f348a4041bd3", "email": "ainun01@mentorhipers.local", "email_verified": false, "phone_verified": false}	email	2026-03-29 05:18:44.981079+00	2026-03-29 05:18:44.981124+00	2026-03-29 05:18:44.981124+00	0d08acc7-eb0e-44f5-abe7-3ff588e35ed1
49f749b7-6973-463f-a122-22748aa7da8f	49f749b7-6973-463f-a122-22748aa7da8f	{"sub": "49f749b7-6973-463f-a122-22748aa7da8f", "email": "radiakbarr@mentorhipers.local", "email_verified": false, "phone_verified": false}	email	2026-03-29 05:18:45.122929+00	2026-03-29 05:18:45.122978+00	2026-03-29 05:18:45.122978+00	7dc0d8a0-f9da-4116-8a01-e26c248693b8
b96b7653-26a3-4cb4-a17a-4eebbad1342d	b96b7653-26a3-4cb4-a17a-4eebbad1342d	{"sub": "b96b7653-26a3-4cb4-a17a-4eebbad1342d", "email": "fthyaa@mentorhipers.local", "email_verified": false, "phone_verified": false}	email	2026-03-29 05:18:45.262212+00	2026-03-29 05:18:45.262255+00	2026-03-29 05:18:45.262255+00	f3fe7571-e59b-436a-8519-dbcaf792bfa7
415bf887-40f4-464e-b7bd-20de942bedda	415bf887-40f4-464e-b7bd-20de942bedda	{"sub": "415bf887-40f4-464e-b7bd-20de942bedda", "email": "admin@mentorhipers.local", "email_verified": false, "phone_verified": false}	email	2026-03-29 05:18:45.392965+00	2026-03-29 05:18:45.393011+00	2026-03-29 05:18:45.393011+00	947be2f1-dcbd-46ca-8a62-c7e8a228c201
161c689a-0a78-4be2-8c77-157d18276954	161c689a-0a78-4be2-8c77-157d18276954	{"sub": "161c689a-0a78-4be2-8c77-157d18276954", "email": "fathyaa@mentorhipers.local", "email_verified": false, "phone_verified": false}	email	2026-03-29 05:18:45.532496+00	2026-03-29 05:18:45.532543+00	2026-03-29 05:18:45.532543+00	ce47d6d9-7df2-4fc5-9c79-7dc20f82ea10
6ad9103e-4a03-48aa-9e78-3d3d20a21c00	6ad9103e-4a03-48aa-9e78-3d3d20a21c00	{"sub": "6ad9103e-4a03-48aa-9e78-3d3d20a21c00", "email": "allisha@mentorhipers.local", "email_verified": false, "phone_verified": false}	email	2026-03-29 05:18:45.662603+00	2026-03-29 05:18:45.662651+00	2026-03-29 05:18:45.662651+00	bbcc3b8d-eb4f-4b62-8dcd-c10fcec5c564
dcbce075-1474-4774-8d5f-a954af2d525a	dcbce075-1474-4774-8d5f-a954af2d525a	{"sub": "dcbce075-1474-4774-8d5f-a954af2d525a", "email": "lifein.nayanika@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-03-29 05:18:45.803045+00	2026-03-29 05:18:45.803093+00	2026-03-29 05:18:45.803093+00	1bc14456-8fa5-4a24-841f-80faac2b0488
2643c4ad-992b-4ad0-a325-df9ccc7f91f6	2643c4ad-992b-4ad0-a325-df9ccc7f91f6	{"sub": "2643c4ad-992b-4ad0-a325-df9ccc7f91f6", "email": "shinyinterior@mentorhipers.local", "email_verified": false, "phone_verified": false}	email	2026-04-02 08:16:15.229213+00	2026-04-02 08:16:15.231307+00	2026-04-02 08:16:15.231307+00	674ab8a9-d84e-442b-8980-528ad54cad3e
8bc0bda5-b788-476e-9966-31206b9fb38d	8bc0bda5-b788-476e-9966-31206b9fb38d	{"sub": "8bc0bda5-b788-476e-9966-31206b9fb38d", "email": "habibbah@mentorhipers.local", "email_verified": false, "phone_verified": false}	email	2026-04-02 08:24:51.038513+00	2026-04-02 08:24:51.03989+00	2026-04-02 08:24:51.03989+00	447bb48f-a20a-4526-bfc8-87bed872194e
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_clients (id, client_secret_hash, registration_type, redirect_uris, grant_types, client_name, client_uri, logo_uri, created_at, updated_at, deleted_at, client_type, token_endpoint_auth_method) FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag, oauth_client_id, refresh_token_hmac_key, refresh_token_counter, scopes) FROM stdin;
15af2960-f442-49d3-a1cb-6f2962bc379f	70f406c8-985c-4b16-af6d-68481e60bf32	2026-03-29 07:04:45.891573+00	2026-03-29 07:04:45.891573+00	\N	aal1	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	39.194.4.19	\N	\N	\N	\N	\N
84449ce7-59c9-4ea4-8b89-80167f02ec63	dcdd1ff2-fc86-4a07-9d88-74e8c21c8be2	2026-03-29 14:52:08.100846+00	2026-03-29 14:52:08.100846+00	\N	aal1	\N	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Mobile/15E148 Safari/604.1	43.252.9.70	\N	\N	\N	\N	\N
7bf94147-dbf7-458b-bd18-3164266434c6	9e557ae3-2517-43c7-80df-2700ec910ec5	2026-03-29 13:15:05.251048+00	2026-03-31 09:10:53.650169+00	\N	aal1	\N	2026-03-31 09:10:53.650072	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	36.70.249.157	\N	\N	\N	\N	\N
9ca2375a-2527-4278-a9e2-1886f3eccfc7	70f406c8-985c-4b16-af6d-68481e60bf32	2026-03-29 07:34:03.607338+00	2026-04-02 07:55:27.812453+00	\N	aal1	\N	2026-04-02 07:55:27.812001	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	39.194.2.208	\N	\N	\N	\N	\N
d159e928-1537-4a58-a0c9-af94bc94fd18	59528fbf-7da5-4b93-ac63-578c212f9849	2026-03-29 13:22:15.296469+00	2026-04-01 21:07:36.845623+00	\N	aal1	\N	2026-04-01 21:07:36.845528	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	158.140.166.97	\N	\N	\N	\N	\N
24e160f3-a753-4a96-a31a-9b2443ea02fd	237593b0-b857-4f0e-81fc-448f838e3ba6	2026-03-29 12:37:47.519004+00	2026-03-29 12:37:47.519004+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36	114.10.64.180	\N	\N	\N	\N	\N
078d8b02-4933-4040-ab1b-dca1e7d6b659	03ab5ebc-36bf-4cf6-948c-4f86ffdbbde3	2026-03-30 02:07:37.94522+00	2026-03-30 06:25:02.678401+00	\N	aal1	\N	2026-03-30 06:25:02.677949	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15	157.85.206.207	\N	\N	\N	\N	\N
65f9c1a6-44c8-4f32-9ba4-d85b0f0f4859	17640674-04f2-4b1c-b065-4b56a68e595b	2026-03-29 16:24:44.209125+00	2026-03-29 16:24:44.209125+00	\N	aal1	\N	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	103.144.90.116	\N	\N	\N	\N	\N
95b4bc3f-cd31-4138-ba1c-f20c620d0ba8	f80c971a-5a82-4ced-83fb-1ee295a252b3	2026-03-29 12:27:02.284329+00	2026-03-29 13:36:06.347885+00	\N	aal1	\N	2026-03-29 13:36:06.347785	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	36.77.195.162	\N	\N	\N	\N	\N
a0ecbd90-93be-48a2-9645-3f7b3eaa103b	9e557ae3-2517-43c7-80df-2700ec910ec5	2026-03-29 16:26:18.190252+00	2026-03-29 16:26:18.190252+00	\N	aal1	\N	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	103.144.90.116	\N	\N	\N	\N	\N
8a7a9b0e-6a67-444f-b666-189b343fb199	b6d69be7-f77a-4873-bd82-425ca563d6f1	2026-03-29 16:27:48.688868+00	2026-03-29 16:27:48.688868+00	\N	aal1	\N	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	103.144.90.116	\N	\N	\N	\N	\N
2c0f8d5c-1db4-46d9-8fed-8980bfc29e3e	03c2a3c3-197e-45a0-a67d-95fc4288d21b	2026-03-29 16:29:30.979762+00	2026-03-29 16:29:30.979762+00	\N	aal1	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	39.194.2.67	\N	\N	\N	\N	\N
4e081d86-45f8-4801-a57c-9629bd96e56d	f80c971a-5a82-4ced-83fb-1ee295a252b3	2026-03-29 14:29:55.177833+00	2026-03-29 14:29:55.177833+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	36.77.195.162	\N	\N	\N	\N	\N
4094b92b-0ef3-4c8a-b975-a939c021d0da	7f569eac-1fb2-4c5a-9074-ca5fa50d3724	2026-03-29 12:20:06.267737+00	2026-03-30 04:15:33.535295+00	\N	aal1	\N	2026-03-30 04:15:33.53518	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36	160.19.156.25	\N	\N	\N	\N	\N
dd34715a-fa6e-48b0-9b21-7cc1aed29106	4e949fa0-c160-4a4c-8e5b-dcb87426fddb	2026-03-29 12:45:36.558884+00	2026-03-30 07:38:44.924612+00	\N	aal1	\N	2026-03-30 07:38:44.92421	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	182.253.159.88	\N	\N	\N	\N	\N
24091b0a-3979-4f69-9039-6d8b1ae844a0	b6d69be7-f77a-4873-bd82-425ca563d6f1	2026-03-29 11:31:40.4867+00	2026-03-31 08:09:25.450976+00	\N	aal1	\N	2026-03-31 08:09:25.450609	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	103.144.90.118	\N	\N	\N	\N	\N
7608888a-b6e7-4c00-8866-6ab0c2bf962d	dcdd1ff2-fc86-4a07-9d88-74e8c21c8be2	2026-03-29 14:55:21.789316+00	2026-03-30 01:54:51.564671+00	\N	aal1	\N	2026-03-30 01:54:51.564569	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Mobile/15E148 Safari/604.1	43.252.9.70	\N	\N	\N	\N	\N
edb0eaa0-2395-47e7-94e9-b7285e70518e	afc33010-fcb8-4cf4-a75b-23bbb096f014	2026-03-29 13:23:35.013849+00	2026-03-31 02:30:23.221607+00	\N	aal1	\N	2026-03-31 02:30:23.221503	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15	180.243.125.49	\N	\N	\N	\N	\N
57c9a63c-ca13-4556-8175-4cf991738694	03ab5ebc-36bf-4cf6-948c-4f86ffdbbde3	2026-03-30 01:51:50.402025+00	2026-03-30 01:51:50.402025+00	\N	aal1	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15	157.85.206.207	\N	\N	\N	\N	\N
5c13d680-de01-48f2-b5f3-40f0cf08a8c0	b6d69be7-f77a-4873-bd82-425ca563d6f1	2026-03-29 16:39:25.500362+00	2026-03-31 06:08:34.347718+00	\N	aal1	\N	2026-03-31 06:08:34.347361	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	103.144.90.118	\N	\N	\N	\N	\N
c2e43bcf-bfbc-454f-9829-bcd373ec0efa	b6d69be7-f77a-4873-bd82-425ca563d6f1	2026-03-29 16:31:00.559475+00	2026-03-30 08:27:19.834147+00	\N	aal1	\N	2026-03-30 08:27:19.834041	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1	39.194.2.67	\N	\N	\N	\N	\N
0a53a346-b798-4955-8256-31083cb30c74	f80c971a-5a82-4ced-83fb-1ee295a252b3	2026-03-29 14:30:54.246298+00	2026-03-30 09:49:40.820226+00	\N	aal1	\N	2026-03-30 09:49:40.819833	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	114.8.205.32	\N	\N	\N	\N	\N
49aaa0be-0b6f-475f-be2c-91ebd87f6f4b	17640674-04f2-4b1c-b065-4b56a68e595b	2026-03-29 12:18:21.286447+00	2026-03-30 03:30:59.205655+00	\N	aal1	\N	2026-03-30 03:30:59.205088	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	103.157.48.17	\N	\N	\N	\N	\N
be456bc8-7917-4ada-9c83-08f7abd06067	5240aafe-ff7c-4038-9970-4563f64928ec	2026-03-30 02:36:41.798128+00	2026-03-30 02:36:41.798128+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	118.99.81.14	\N	\N	\N	\N	\N
b7a287cd-7143-443d-8241-10101347cc9a	03c2a3c3-197e-45a0-a67d-95fc4288d21b	2026-03-29 07:13:51.786162+00	2026-03-30 06:42:46.70233+00	\N	aal1	\N	2026-03-30 06:42:46.700536	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	39.194.2.67	\N	\N	\N	\N	\N
56d4e5e4-5ceb-41fb-bb76-1f484baa5b59	4e949fa0-c160-4a4c-8e5b-dcb87426fddb	2026-03-29 14:26:35.699356+00	2026-03-30 07:46:13.135087+00	\N	aal1	\N	2026-03-30 07:46:13.134665	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36	182.253.159.88	\N	\N	\N	\N	\N
ffe71664-9463-49e4-b049-c0cc08447131	8bc43a7a-c98b-42c5-91ee-1e421c2aaf92	2026-03-29 12:19:31.62067+00	2026-04-02 14:00:51.214999+00	\N	aal1	\N	2026-04-02 14:00:51.214891	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15	182.253.245.80	\N	\N	\N	\N	\N
8925e2f2-fdf1-4699-aba7-bd3c5bbd5363	5240aafe-ff7c-4038-9970-4563f64928ec	2026-03-29 11:01:48.633776+00	2026-03-30 10:52:01.290765+00	\N	aal1	\N	2026-03-30 10:52:01.289548	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	103.148.197.81	\N	\N	\N	\N	\N
6079aa96-f939-4afa-870d-fccdfc3649e9	dcdd1ff2-fc86-4a07-9d88-74e8c21c8be2	2026-03-30 01:49:16.316382+00	2026-04-01 11:53:08.962418+00	\N	aal1	\N	2026-04-01 11:53:08.962321	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	118.99.84.99	\N	\N	\N	\N	\N
b67b55db-428a-4863-ba01-3f62839ebd23	49f749b7-6973-463f-a122-22748aa7da8f	2026-03-29 12:18:29.593092+00	2026-04-02 06:27:52.554224+00	\N	aal1	\N	2026-04-02 06:27:52.552967	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 OPR/128.0.0.0 (Edition ms_store)	111.94.28.82	\N	\N	\N	\N	\N
9ed5bb15-15d0-4144-b0fb-eba3a706ad88	17640674-04f2-4b1c-b065-4b56a68e595b	2026-03-30 03:31:01.58826+00	2026-03-30 03:31:01.58826+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	103.157.48.17	\N	\N	\N	\N	\N
9889f5bb-d775-4f67-8c50-2fa92898f7b4	17640674-04f2-4b1c-b065-4b56a68e595b	2026-03-30 03:31:49.937802+00	2026-03-30 05:15:16.805147+00	\N	aal1	\N	2026-03-30 05:15:16.803769	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	103.157.48.17	\N	\N	\N	\N	\N
de7bd133-72d1-4bbd-96a6-b22db1173cf9	03ab5ebc-36bf-4cf6-948c-4f86ffdbbde3	2026-03-31 02:33:55.945796+00	2026-03-31 16:18:12.263946+00	\N	aal1	\N	2026-03-31 16:18:12.262973	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15	180.252.130.28	\N	\N	\N	\N	\N
fe4d8b6a-ff63-40d5-bd4f-35730b805b5d	03ab5ebc-36bf-4cf6-948c-4f86ffdbbde3	2026-03-30 06:25:05.139196+00	2026-03-30 07:29:56.476651+00	\N	aal1	\N	2026-03-30 07:29:56.475382	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15	157.85.206.207	\N	\N	\N	\N	\N
40929eb6-b900-4494-807d-a5e744b6fbc6	4e949fa0-c160-4a4c-8e5b-dcb87426fddb	2026-03-30 07:46:16.030482+00	2026-03-30 07:46:16.030482+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36	182.253.159.88	\N	\N	\N	\N	\N
1b0240eb-d187-42b0-bc71-4282880de07d	4e949fa0-c160-4a4c-8e5b-dcb87426fddb	2026-03-30 07:47:56.560395+00	2026-03-30 07:47:56.560395+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36	182.253.159.88	\N	\N	\N	\N	\N
7e034fa9-ed69-4c9e-9045-71e307f85701	b6d69be7-f77a-4873-bd82-425ca563d6f1	2026-03-30 08:29:07.966339+00	2026-03-30 08:29:07.966339+00	\N	aal1	\N	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	103.144.90.118	\N	\N	\N	\N	\N
a661dd88-e6d0-44eb-9692-d32f3fd2a3cc	9e557ae3-2517-43c7-80df-2700ec910ec5	2026-03-30 08:40:16.848467+00	2026-03-30 08:40:16.848467+00	\N	aal1	\N	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	103.144.90.116	\N	\N	\N	\N	\N
0519d6d1-4310-4f32-9eef-c61ee575c78d	237593b0-b857-4f0e-81fc-448f838e3ba6	2026-03-30 17:21:21.743655+00	2026-03-31 09:27:01.168635+00	\N	aal1	\N	2026-03-31 09:27:01.16854	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	158.140.182.98	\N	\N	\N	\N	\N
86951d66-bce5-4184-9612-23aa896c4274	17640674-04f2-4b1c-b065-4b56a68e595b	2026-03-30 08:42:17.509564+00	2026-03-30 08:42:17.509564+00	\N	aal1	\N	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	103.144.90.116	\N	\N	\N	\N	\N
dca166f5-97db-458b-b73f-b94fd6de2bfd	9e557ae3-2517-43c7-80df-2700ec910ec5	2026-03-30 13:22:03.81954+00	2026-03-30 13:22:03.81954+00	\N	aal1	\N	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	103.144.90.116	\N	\N	\N	\N	\N
3af8f97b-d6cb-414e-9aff-e5ba3bc919aa	4e949fa0-c160-4a4c-8e5b-dcb87426fddb	2026-03-30 07:54:19.864884+00	2026-04-02 15:31:04.895768+00	\N	aal1	\N	2026-04-02 15:31:04.894027	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36	103.156.114.93	\N	\N	\N	\N	\N
a22f94b3-2082-469a-b443-d5012aff0811	9e557ae3-2517-43c7-80df-2700ec910ec5	2026-03-30 11:57:12.44643+00	2026-03-30 11:57:12.44643+00	\N	aal1	\N	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	103.144.90.118	\N	\N	\N	\N	\N
2459e23f-3056-4e07-bf81-564def41e57d	9e557ae3-2517-43c7-80df-2700ec910ec5	2026-03-31 00:03:09.769385+00	2026-03-31 00:03:09.769385+00	\N	aal1	\N	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	140.213.220.221	\N	\N	\N	\N	\N
6d08e063-542b-4a08-8850-0da538569127	f80c971a-5a82-4ced-83fb-1ee295a252b3	2026-03-30 09:49:49.245776+00	2026-03-31 15:22:38.983568+00	\N	aal1	\N	2026-03-31 15:22:38.983471	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	36.71.221.5	\N	\N	\N	\N	\N
6c5c7b52-a4c3-4c37-b891-427b9dfdac4e	12089ea2-7925-4209-ba3a-d6b0976079b9	2026-03-30 13:30:13.100926+00	2026-03-31 13:48:54.803177+00	\N	aal1	\N	2026-03-31 13:48:54.803087	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	114.4.79.70	\N	\N	\N	\N	\N
6c309999-5de6-4971-a9e5-6d60f9164d78	237593b0-b857-4f0e-81fc-448f838e3ba6	2026-03-30 11:26:31.581985+00	2026-03-30 16:47:02.680906+00	\N	aal1	\N	2026-03-30 16:47:02.680811	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	158.140.182.98	\N	\N	\N	\N	\N
b2b6dc1a-244e-4a11-97de-e0d5659b0b68	9e557ae3-2517-43c7-80df-2700ec910ec5	2026-03-30 21:08:17.85948+00	2026-03-30 21:08:17.85948+00	\N	aal1	\N	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	103.144.90.116	\N	\N	\N	\N	\N
dd5f252b-92b7-4857-8e5f-78de53186db6	17640674-04f2-4b1c-b065-4b56a68e595b	2026-03-30 21:09:24.690038+00	2026-03-30 21:09:24.690038+00	\N	aal1	\N	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	103.144.90.116	\N	\N	\N	\N	\N
33cab24d-b467-4e37-9385-dbbd97a005d1	03ab5ebc-36bf-4cf6-948c-4f86ffdbbde3	2026-03-30 07:29:58.400078+00	2026-03-31 02:33:52.179379+00	\N	aal1	\N	2026-03-31 02:33:52.178533	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15	157.85.206.51	\N	\N	\N	\N	\N
888356c7-c576-463e-b487-27ae3e3824e7	9e557ae3-2517-43c7-80df-2700ec910ec5	2026-03-31 03:08:35.860458+00	2026-03-31 03:08:35.860458+00	\N	aal1	\N	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	203.78.123.140	\N	\N	\N	\N	\N
9d325d84-e10e-4f68-9099-f7293245ff0a	17640674-04f2-4b1c-b065-4b56a68e595b	2026-03-30 05:20:04.675529+00	2026-03-31 08:15:48.170043+00	\N	aal1	\N	2026-03-31 08:15:48.169947	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	103.157.48.17	\N	\N	\N	\N	\N
04427342-13e3-4329-946d-96be129a7c6f	e6cc8572-9783-42bc-94bd-bdc32ccfbac8	2026-03-30 13:14:41.717016+00	2026-03-31 10:24:30.998185+00	\N	aal1	\N	2026-03-31 10:24:30.995535	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	110.138.81.130	\N	\N	\N	\N	\N
2ae5bcdc-eb42-4779-bec0-7a761cb22638	5240aafe-ff7c-4038-9970-4563f64928ec	2026-03-30 11:30:37.958375+00	2026-03-31 14:15:43.057594+00	\N	aal1	\N	2026-03-31 14:15:43.0575	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	103.148.196.10	\N	\N	\N	\N	\N
35735c02-c556-4759-9359-adc4f4baa246	7f569eac-1fb2-4c5a-9074-ca5fa50d3724	2026-03-31 01:57:43.733762+00	2026-04-01 01:41:07.821258+00	\N	aal1	\N	2026-04-01 01:41:07.821164	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	103.166.211.10	\N	\N	\N	\N	\N
bbdcd7c2-0745-4225-bf47-6f29e7061bba	03c2a3c3-197e-45a0-a67d-95fc4288d21b	2026-03-30 07:30:20.150611+00	2026-04-01 08:50:47.645191+00	\N	aal1	\N	2026-04-01 08:50:47.644722	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	39.194.2.208	\N	\N	\N	\N	\N
10dca00a-5227-40f5-ab4c-6271cb2280d2	4e949fa0-c160-4a4c-8e5b-dcb87426fddb	2026-03-30 07:46:39.132712+00	2026-04-01 14:01:25.632259+00	\N	aal1	\N	2026-04-01 14:01:25.628941	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	103.156.114.93	\N	\N	\N	\N	\N
a2c9765e-c8d3-4cb3-b77f-e84115258479	9e557ae3-2517-43c7-80df-2700ec910ec5	2026-03-31 03:59:23.756356+00	2026-03-31 03:59:23.756356+00	\N	aal1	\N	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	203.78.123.14	\N	\N	\N	\N	\N
6bf4110a-0419-4105-a0f2-5d01cab3bdfd	17640674-04f2-4b1c-b065-4b56a68e595b	2026-03-31 15:09:41.738327+00	2026-04-01 14:09:14.464656+00	\N	aal1	\N	2026-04-01 14:09:14.464556	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	101.128.101.22	\N	\N	\N	\N	\N
0a95378e-b2ef-4616-8c4e-7c7a51abc678	9e557ae3-2517-43c7-80df-2700ec910ec5	2026-03-31 10:16:05.249121+00	2026-03-31 10:16:05.249121+00	\N	aal1	\N	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	103.144.90.116	\N	\N	\N	\N	\N
8a9bff1b-89db-4fcd-9d13-1b63de2a6694	e6cc8572-9783-42bc-94bd-bdc32ccfbac8	2026-03-31 10:24:44.216389+00	2026-03-31 10:24:44.216389+00	\N	aal1	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	110.138.81.130	\N	\N	\N	\N	\N
ca849098-7c49-4f03-83fe-b2d425ba1705	237593b0-b857-4f0e-81fc-448f838e3ba6	2026-03-31 16:02:13.595235+00	2026-04-01 10:23:00.433941+00	\N	aal1	\N	2026-04-01 10:23:00.433298	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	158.140.180.25	\N	\N	\N	\N	\N
9094b3e8-9ae6-4fad-ac7f-06d954fac04f	17640674-04f2-4b1c-b065-4b56a68e595b	2026-03-31 08:41:38.894986+00	2026-03-31 15:09:39.704645+00	\N	aal1	\N	2026-03-31 15:09:39.704551	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	101.128.101.22	\N	\N	\N	\N	\N
50482747-7228-4cee-a1d1-fc397161d261	f80c971a-5a82-4ced-83fb-1ee295a252b3	2026-03-31 15:22:41.686858+00	2026-03-31 15:22:41.686858+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	36.71.221.5	\N	\N	\N	\N	\N
560d1784-f626-4e39-84f2-641d2cbc2fd9	237593b0-b857-4f0e-81fc-448f838e3ba6	2026-03-31 09:27:03.301568+00	2026-03-31 16:02:11.542094+00	\N	aal1	\N	2026-03-31 16:02:11.541244	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	158.140.182.98	\N	\N	\N	\N	\N
b83621fb-4d3b-4c0a-a922-42834e1a55c4	03ab5ebc-36bf-4cf6-948c-4f86ffdbbde3	2026-03-31 16:19:18.87211+00	2026-03-31 16:19:18.87211+00	\N	aal1	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15	180.252.130.28	\N	\N	\N	\N	\N
7db5e96c-452a-4c5f-b355-4ae23b0b7caf	9e557ae3-2517-43c7-80df-2700ec910ec5	2026-03-31 17:41:13.859427+00	2026-03-31 17:41:13.859427+00	\N	aal1	\N	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	103.144.90.118	\N	\N	\N	\N	\N
f275af0e-0209-418f-8c81-d7ef81886d85	7f569eac-1fb2-4c5a-9074-ca5fa50d3724	2026-04-01 01:41:16.17317+00	2026-04-01 03:24:05.737858+00	\N	aal1	\N	2026-04-01 03:24:05.737757	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	103.166.211.10	\N	\N	\N	\N	\N
9e7bc1d2-e1bb-4504-b910-6af8792e665e	9e557ae3-2517-43c7-80df-2700ec910ec5	2026-03-31 06:09:59.256244+00	2026-04-01 05:41:33.141394+00	\N	aal1	\N	2026-04-01 05:41:33.141298	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36	222.124.95.191	\N	\N	\N	\N	\N
470f633b-2aca-4415-b803-05f6589ea2b2	9e557ae3-2517-43c7-80df-2700ec910ec5	2026-04-01 05:41:37.619969+00	2026-04-01 05:41:37.619969+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36	222.124.95.191	\N	\N	\N	\N	\N
2d771456-de74-485f-ace9-c87a686df8b8	9e557ae3-2517-43c7-80df-2700ec910ec5	2026-03-31 09:11:05.631061+00	2026-04-01 11:45:39.0382+00	\N	aal1	\N	2026-04-01 11:45:39.038101	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	222.124.95.191	\N	\N	\N	\N	\N
25082c96-9ef5-43d1-88e4-4d35b57bd97d	b6d69be7-f77a-4873-bd82-425ca563d6f1	2026-04-01 10:33:48.590438+00	2026-04-01 10:33:48.590438+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36	103.144.90.118	\N	\N	\N	\N	\N
25c78c30-4eb5-4b9c-b543-65b26c8b4758	b6d69be7-f77a-4873-bd82-425ca563d6f1	2026-04-01 10:35:24.876891+00	2026-04-01 10:35:24.876891+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36	103.144.90.118	\N	\N	\N	\N	\N
6e097e48-836d-4849-a90f-a1ce2b3c80dd	b6d69be7-f77a-4873-bd82-425ca563d6f1	2026-04-01 10:38:49.086576+00	2026-04-01 10:38:49.086576+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36	103.144.90.117	\N	\N	\N	\N	\N
add96c67-78be-4118-b771-fb8173fae889	17640674-04f2-4b1c-b065-4b56a68e595b	2026-04-01 14:09:16.745173+00	2026-04-01 16:28:05.050579+00	\N	aal1	\N	2026-04-01 16:28:05.050481	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	101.128.101.22	\N	\N	\N	\N	\N
ff915bc1-4795-463a-b50e-33749da3a0b1	f80c971a-5a82-4ced-83fb-1ee295a252b3	2026-03-31 15:27:20.758052+00	2026-04-01 13:40:10.886964+00	\N	aal1	\N	2026-04-01 13:40:10.886856	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	36.71.221.5	\N	\N	\N	\N	\N
a41fff56-89c7-4826-aa8d-638f24c2d8e2	03c2a3c3-197e-45a0-a67d-95fc4288d21b	2026-04-01 08:59:15.438609+00	2026-04-01 11:39:35.011727+00	\N	aal1	\N	2026-04-01 11:39:35.01161	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	39.194.2.208	\N	\N	\N	\N	\N
94343b5d-10bb-4cfc-85fe-d8438628c64a	ca5b9250-5867-4adf-a23b-120eec075fd0	2026-03-30 13:48:22.557731+00	2026-04-02 04:25:48.927942+00	\N	aal1	\N	2026-04-02 04:25:48.92784	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	103.237.141.102	\N	\N	\N	\N	\N
015efcb3-472c-4ef6-94eb-355726d63a81	03c2a3c3-197e-45a0-a67d-95fc4288d21b	2026-04-01 11:39:54.026984+00	2026-04-02 07:02:55.024856+00	\N	aal1	\N	2026-04-02 07:02:55.024753	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	39.194.2.208	\N	\N	\N	\N	\N
da366692-adc1-4ac4-abd9-4c2779d6cfa4	9e557ae3-2517-43c7-80df-2700ec910ec5	2026-04-01 11:45:49.134727+00	2026-04-01 15:15:31.564693+00	\N	aal1	\N	2026-04-01 15:15:31.564224	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	222.124.95.191	\N	\N	\N	\N	\N
b8b59a5a-d476-4be4-8d77-5a4a7af04cba	5240aafe-ff7c-4038-9970-4563f64928ec	2026-03-31 14:32:41.313761+00	2026-04-01 13:58:35.264349+00	\N	aal1	\N	2026-04-01 13:58:35.262866	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	103.148.196.9	\N	\N	\N	\N	\N
c8c67fd7-5fcd-4859-8d6b-ddc7b18bb179	5240aafe-ff7c-4038-9970-4563f64928ec	2026-04-01 14:13:20.834448+00	2026-04-01 14:13:20.834448+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	103.148.197.81	\N	\N	\N	\N	\N
26c3fd86-74c3-4e93-b54e-2b4d628cdecc	12089ea2-7925-4209-ba3a-d6b0976079b9	2026-04-01 02:44:28.875654+00	2026-04-01 16:18:52.790137+00	\N	aal1	\N	2026-04-01 16:18:52.790039	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	114.8.199.213	\N	\N	\N	\N	\N
123fc6e3-ef7d-40c0-befc-ae7105a184a9	237593b0-b857-4f0e-81fc-448f838e3ba6	2026-04-01 10:23:08.268011+00	2026-04-02 07:12:01.905487+00	\N	aal1	\N	2026-04-02 07:12:01.90506	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	158.140.182.2	\N	\N	\N	\N	\N
2668283d-50af-4120-971c-0714a8aa34c2	96ae0d10-51f5-4fda-a5c0-1a778a9ab46e	2026-04-01 12:36:02.512031+00	2026-04-02 15:05:33.338164+00	\N	aal1	\N	2026-04-02 15:05:33.338069	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36	182.2.191.44	\N	\N	\N	\N	\N
f3d563d2-fdcb-4947-9e57-93e589101945	f80c971a-5a82-4ced-83fb-1ee295a252b3	2026-04-01 14:11:06.673758+00	2026-04-02 15:14:56.803719+00	\N	aal1	\N	2026-04-02 15:14:56.803627	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	36.71.221.5	\N	\N	\N	\N	\N
5190e1f8-699a-470c-bc1f-cd512952492f	f80c971a-5a82-4ced-83fb-1ee295a252b3	2026-04-01 14:13:30.307603+00	2026-04-01 14:13:30.307603+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0	36.71.221.5	\N	\N	\N	\N	\N
14e2b0ae-ce08-419a-af73-7235f09b10f1	9e557ae3-2517-43c7-80df-2700ec910ec5	2026-04-01 16:00:00.692117+00	2026-04-01 16:00:00.692117+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36	103.144.90.117	\N	\N	\N	\N	\N
70300518-a296-49ba-b58f-e0095d3af967	b6d69be7-f77a-4873-bd82-425ca563d6f1	2026-04-01 16:02:52.39385+00	2026-04-01 16:02:52.39385+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36	103.144.90.117	\N	\N	\N	\N	\N
9944ac62-7a21-47f9-947c-5c2cb5cf8ce9	b6d69be7-f77a-4873-bd82-425ca563d6f1	2026-04-02 00:18:52.734554+00	2026-04-02 00:18:52.734554+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36	140.213.220.133	\N	\N	\N	\N	\N
387db9d7-cd6a-4f04-ac4f-20e32f4b9647	17640674-04f2-4b1c-b065-4b56a68e595b	2026-04-02 01:01:14.491915+00	2026-04-02 01:01:14.491915+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36	203.78.123.26	\N	\N	\N	\N	\N
b0e9c90a-f642-463d-bc02-0bc93dae432c	b6d69be7-f77a-4873-bd82-425ca563d6f1	2026-04-02 03:47:20.480905+00	2026-04-02 03:47:20.480905+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36	140.213.220.37	\N	\N	\N	\N	\N
75c63164-b665-4493-bd22-0fd19691e92a	b6d69be7-f77a-4873-bd82-425ca563d6f1	2026-04-02 03:48:54.716999+00	2026-04-02 03:48:54.716999+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36	140.213.191.170	\N	\N	\N	\N	\N
5d2143ce-9104-4fc7-b69a-d81a90f032e7	f3c27e4e-db1a-478b-8f9f-f0e9fa742356	2026-04-02 15:06:41.334787+00	2026-04-02 15:06:41.334787+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	182.3.42.157	\N	\N	\N	\N	\N
7bc05121-7578-49a0-b428-1c30da66e2f1	2643c4ad-992b-4ad0-a325-df9ccc7f91f6	2026-04-02 08:18:23.678078+00	2026-04-02 08:18:23.678078+00	\N	aal1	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	39.194.2.208	\N	\N	\N	\N	\N
69fedcaa-6f85-4858-a305-682c7bbfa7ed	2643c4ad-992b-4ad0-a325-df9ccc7f91f6	2026-04-02 08:18:36.431155+00	2026-04-02 08:18:36.431155+00	\N	aal1	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	39.194.2.208	\N	\N	\N	\N	\N
ffe7510c-f66b-4cd7-8576-0bd0557c87af	2643c4ad-992b-4ad0-a325-df9ccc7f91f6	2026-04-02 08:20:16.893882+00	2026-04-02 08:20:16.893882+00	\N	aal1	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	39.194.2.208	\N	\N	\N	\N	\N
959b45f2-7dcd-4132-aa87-7e4710aac541	2643c4ad-992b-4ad0-a325-df9ccc7f91f6	2026-04-02 08:20:34.516913+00	2026-04-02 08:20:34.516913+00	\N	aal1	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	39.194.2.208	\N	\N	\N	\N	\N
b4276e1f-b06c-4e59-ba57-01aac8189d63	8bc0bda5-b788-476e-9966-31206b9fb38d	2026-04-02 15:08:13.415741+00	2026-04-02 15:08:13.415741+00	\N	aal1	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	39.194.2.224	\N	\N	\N	\N	\N
9748f8c0-9e1e-4b0f-bd86-abc1297f4808	8bc0bda5-b788-476e-9966-31206b9fb38d	2026-04-02 08:25:05.866814+00	2026-04-02 08:25:05.866814+00	\N	aal1	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	39.194.2.208	\N	\N	\N	\N	\N
68b4cdd9-5b07-4e3f-a86c-bc5497fad4c9	17640674-04f2-4b1c-b065-4b56a68e595b	2026-04-02 15:08:17.908888+00	2026-04-02 15:08:17.908888+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	101.128.101.22	\N	\N	\N	\N	\N
4adf3cb4-0821-427f-9b2e-773114c8de7e	03c2a3c3-197e-45a0-a67d-95fc4288d21b	2026-04-02 07:05:50.143363+00	2026-04-02 09:06:58.945472+00	\N	aal1	\N	2026-04-02 09:06:58.937229	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	39.194.2.208	\N	\N	\N	\N	\N
d71b7602-fdc5-46d5-8327-2eeff5bca17a	8bc0bda5-b788-476e-9966-31206b9fb38d	2026-04-02 09:07:01.426673+00	2026-04-02 09:07:01.426673+00	\N	aal1	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	39.194.2.208	\N	\N	\N	\N	\N
fb564140-af79-4934-91a9-852c01635aa1	8bc0bda5-b788-476e-9966-31206b9fb38d	2026-04-02 09:17:04.200074+00	2026-04-02 09:17:04.200074+00	\N	aal1	\N	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 26_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/147.0.7727.47 Mobile/15E148 Safari/604.1	182.2.191.118	\N	\N	\N	\N	\N
9780424b-c5c7-4360-a829-0089698a11d6	9e557ae3-2517-43c7-80df-2700ec910ec5	2026-04-01 15:24:52.29657+00	2026-04-02 14:26:03.524598+00	\N	aal1	\N	2026-04-02 14:26:03.524499	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	222.124.95.191	\N	\N	\N	\N	\N
5daba084-9803-4227-8adf-5165c5433bbf	9e557ae3-2517-43c7-80df-2700ec910ec5	2026-04-02 14:26:17.442841+00	2026-04-02 14:26:17.442841+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	222.124.95.191	\N	\N	\N	\N	\N
1be46f6e-dca0-4c02-8547-8bdcb599c3e1	b6d69be7-f77a-4873-bd82-425ca563d6f1	2026-04-01 13:42:40.895151+00	2026-04-02 15:01:30.839072+00	\N	aal1	\N	2026-04-02 15:01:30.838976	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	103.144.90.117	\N	\N	\N	\N	\N
f60120f9-3de5-4305-a2fa-a5c410f95b80	b6d69be7-f77a-4873-bd82-425ca563d6f1	2026-04-02 15:01:55.604775+00	2026-04-02 15:01:55.604775+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	103.144.90.117	\N	\N	\N	\N	\N
01b505db-1243-4d4c-a0de-9e7a32fe17ce	237593b0-b857-4f0e-81fc-448f838e3ba6	2026-04-02 07:12:04.695281+00	2026-04-02 15:04:28.848049+00	\N	aal1	\N	2026-04-02 15:04:28.847944	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	158.140.182.69	\N	\N	\N	\N	\N
f248ccf2-7b6a-4725-b887-e908aadb4b84	237593b0-b857-4f0e-81fc-448f838e3ba6	2026-04-02 15:04:30.669141+00	2026-04-02 15:04:30.669141+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	158.140.182.69	\N	\N	\N	\N	\N
3bb2944b-7f3b-4f00-a4ba-20d125e3a3ab	03c2a3c3-197e-45a0-a67d-95fc4288d21b	2026-04-02 09:07:14.945442+00	2026-04-02 15:05:21.06566+00	\N	aal1	\N	2026-04-02 15:05:21.065559	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	39.194.2.224	\N	\N	\N	\N	\N
c84e5c0e-541c-4bc2-87ec-1d7cb967c52d	f80c971a-5a82-4ced-83fb-1ee295a252b3	2026-04-02 15:15:08.514525+00	2026-04-02 15:15:08.514525+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	36.71.221.5	\N	\N	\N	\N	\N
ef646cb2-a212-4fa0-b0e4-f082031ee847	f3c27e4e-db1a-478b-8f9f-f0e9fa742356	2026-04-02 15:30:08.248378+00	2026-04-02 15:30:08.248378+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	103.144.90.117	\N	\N	\N	\N	\N
b6deff39-d859-437b-abb1-5e830960e552	03c2a3c3-197e-45a0-a67d-95fc4288d21b	2026-04-02 15:05:45.042496+00	2026-04-02 16:05:58.238755+00	\N	aal1	\N	2026-04-02 16:05:58.238654	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	39.194.2.224	\N	\N	\N	\N	\N
324673f4-31f5-4ef0-8aa3-3b6211d2c49a	2643c4ad-992b-4ad0-a325-df9ccc7f91f6	2026-04-02 12:15:51.210659+00	2026-04-02 16:05:58.301646+00	\N	aal1	\N	2026-04-02 16:05:58.301483	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Mobile/15E148 Safari/604.1	182.2.191.118	\N	\N	\N	\N	\N
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
15af2960-f442-49d3-a1cb-6f2962bc379f	2026-03-29 07:04:45.911674+00	2026-03-29 07:04:45.911674+00	password	a0f77499-f361-4393-a965-8c7df812d62a
b7a287cd-7143-443d-8241-10101347cc9a	2026-03-29 07:13:51.818369+00	2026-03-29 07:13:51.818369+00	password	a46d5d69-c7c4-4313-be94-a9983db3d825
9ca2375a-2527-4278-a9e2-1886f3eccfc7	2026-03-29 07:34:03.663162+00	2026-03-29 07:34:03.663162+00	password	db8ba0f5-27a7-4779-b05d-ddf77e711a14
8925e2f2-fdf1-4699-aba7-bd3c5bbd5363	2026-03-29 11:01:48.787441+00	2026-03-29 11:01:48.787441+00	password	8b633d0a-75ba-4e36-a4c5-db6c4b5d5c01
24091b0a-3979-4f69-9039-6d8b1ae844a0	2026-03-29 11:31:40.539937+00	2026-03-29 11:31:40.539937+00	password	5bfc3eca-7bb6-4caf-bf93-3e9f521db9e1
49aaa0be-0b6f-475f-be2c-91ebd87f6f4b	2026-03-29 12:18:21.363387+00	2026-03-29 12:18:21.363387+00	password	be6aa4de-f009-4216-9296-abc130cfd2a5
b67b55db-428a-4863-ba01-3f62839ebd23	2026-03-29 12:18:29.62601+00	2026-03-29 12:18:29.62601+00	password	2c977605-46d4-47f2-b8d7-3a0366f698a3
ffe71664-9463-49e4-b049-c0cc08447131	2026-03-29 12:19:31.679876+00	2026-03-29 12:19:31.679876+00	password	3c506ee8-802c-438e-9b66-75e573c2993c
4094b92b-0ef3-4c8a-b975-a939c021d0da	2026-03-29 12:20:06.323175+00	2026-03-29 12:20:06.323175+00	password	497d628a-baba-4b7c-b5c8-20f6c124fbff
95b4bc3f-cd31-4138-ba1c-f20c620d0ba8	2026-03-29 12:27:02.314838+00	2026-03-29 12:27:02.314838+00	password	1e767abf-ad30-4340-94a3-09bece8cf494
24e160f3-a753-4a96-a31a-9b2443ea02fd	2026-03-29 12:37:47.558732+00	2026-03-29 12:37:47.558732+00	password	89242cc4-0e05-4e7d-aba6-ddb0b04eb472
dd34715a-fa6e-48b0-9b21-7cc1aed29106	2026-03-29 12:45:36.605988+00	2026-03-29 12:45:36.605988+00	password	1cc57e4c-62ae-44c1-8a49-97e196c649d5
7bf94147-dbf7-458b-bd18-3164266434c6	2026-03-29 13:15:05.318502+00	2026-03-29 13:15:05.318502+00	password	ab0e8fdc-74c8-4dcf-964f-f6c2d75f69ed
d159e928-1537-4a58-a0c9-af94bc94fd18	2026-03-29 13:22:15.333971+00	2026-03-29 13:22:15.333971+00	password	09aabbfb-9fc3-4f07-936b-4b07e2808518
edb0eaa0-2395-47e7-94e9-b7285e70518e	2026-03-29 13:23:35.050611+00	2026-03-29 13:23:35.050611+00	password	18b9efb5-99f5-4740-a027-8288787bd081
56d4e5e4-5ceb-41fb-bb76-1f484baa5b59	2026-03-29 14:26:35.748925+00	2026-03-29 14:26:35.748925+00	password	20047778-f41c-414e-a1f1-e8686737e16a
4e081d86-45f8-4801-a57c-9629bd96e56d	2026-03-29 14:29:55.201927+00	2026-03-29 14:29:55.201927+00	password	996308fd-2610-4c8e-8ba4-092f27995059
0a53a346-b798-4955-8256-31083cb30c74	2026-03-29 14:30:54.30419+00	2026-03-29 14:30:54.30419+00	password	8650a5f4-a5f9-4199-933d-421e88f78ebc
84449ce7-59c9-4ea4-8b89-80167f02ec63	2026-03-29 14:52:08.151091+00	2026-03-29 14:52:08.151091+00	password	dca0f2aa-11a2-48b7-ae9e-aead1be3bb7e
7608888a-b6e7-4c00-8866-6ab0c2bf962d	2026-03-29 14:55:21.829931+00	2026-03-29 14:55:21.829931+00	password	763d7279-4aeb-4bf0-8c73-ddbac8165c4d
65f9c1a6-44c8-4f32-9ba4-d85b0f0f4859	2026-03-29 16:24:44.256843+00	2026-03-29 16:24:44.256843+00	password	5050ad05-6c7b-47cf-b449-281485ac5336
a0ecbd90-93be-48a2-9645-3f7b3eaa103b	2026-03-29 16:26:18.231692+00	2026-03-29 16:26:18.231692+00	password	b8a7c86a-c4aa-489c-89f9-0376cb92a6f3
8a7a9b0e-6a67-444f-b666-189b343fb199	2026-03-29 16:27:48.745821+00	2026-03-29 16:27:48.745821+00	password	12296222-03b8-453d-afe2-d2c30d44f069
2c0f8d5c-1db4-46d9-8fed-8980bfc29e3e	2026-03-29 16:29:31.025431+00	2026-03-29 16:29:31.025431+00	password	83242df5-7828-4f9b-a779-cafb941e6477
c2e43bcf-bfbc-454f-9829-bcd373ec0efa	2026-03-29 16:31:00.605526+00	2026-03-29 16:31:00.605526+00	password	441c8f26-0b7e-4f50-b3ba-e34a3de8f805
5c13d680-de01-48f2-b5f3-40f0cf08a8c0	2026-03-29 16:39:25.559227+00	2026-03-29 16:39:25.559227+00	password	bc3bcaea-4a0d-4dbe-a425-7f76ac563312
6079aa96-f939-4afa-870d-fccdfc3649e9	2026-03-30 01:49:16.367838+00	2026-03-30 01:49:16.367838+00	password	6c3fc4a6-4e4e-41f9-af04-69c344da97ae
57c9a63c-ca13-4556-8175-4cf991738694	2026-03-30 01:51:50.437824+00	2026-03-30 01:51:50.437824+00	password	96e7e542-f9c1-46b5-b0d4-e5a0e99ddc99
078d8b02-4933-4040-ab1b-dca1e7d6b659	2026-03-30 02:07:37.991302+00	2026-03-30 02:07:37.991302+00	password	3209e22a-5b51-4027-9642-700d514ae852
be456bc8-7917-4ada-9c83-08f7abd06067	2026-03-30 02:36:41.848532+00	2026-03-30 02:36:41.848532+00	password	ddf9eeaf-b87d-4aab-abad-00675da1d541
9ed5bb15-15d0-4144-b0fb-eba3a706ad88	2026-03-30 03:31:01.607886+00	2026-03-30 03:31:01.607886+00	password	b6741ce0-d393-4291-a552-87add3105223
9889f5bb-d775-4f67-8c50-2fa92898f7b4	2026-03-30 03:31:49.998511+00	2026-03-30 03:31:49.998511+00	password	547f6a2e-69af-40fb-9c81-17aba534675c
9d325d84-e10e-4f68-9099-f7293245ff0a	2026-03-30 05:20:04.731994+00	2026-03-30 05:20:04.731994+00	password	9cf9a347-8e37-4ea2-a4eb-2410fb86532d
fe4d8b6a-ff63-40d5-bd4f-35730b805b5d	2026-03-30 06:25:05.182754+00	2026-03-30 06:25:05.182754+00	password	73509ff1-89b3-4dd8-ac22-daa4cee735cf
33cab24d-b467-4e37-9385-dbbd97a005d1	2026-03-30 07:29:58.42623+00	2026-03-30 07:29:58.42623+00	password	6c8c78cf-b92c-42ee-92d2-939d243e9cfc
bbdcd7c2-0745-4225-bf47-6f29e7061bba	2026-03-30 07:30:20.192674+00	2026-03-30 07:30:20.192674+00	password	e414e1d7-db53-4965-afba-8a4b6dfdb09c
40929eb6-b900-4494-807d-a5e744b6fbc6	2026-03-30 07:46:16.047178+00	2026-03-30 07:46:16.047178+00	password	9a01cbaf-e416-4fdb-9ae3-026a4f4da238
10dca00a-5227-40f5-ab4c-6271cb2280d2	2026-03-30 07:46:39.181879+00	2026-03-30 07:46:39.181879+00	password	dd0a7d0b-66e5-42ac-8178-fe216cb9eef7
1b0240eb-d187-42b0-bc71-4282880de07d	2026-03-30 07:47:56.62018+00	2026-03-30 07:47:56.62018+00	password	d2ed43bf-741e-474f-9a48-631f8e55f680
3af8f97b-d6cb-414e-9aff-e5ba3bc919aa	2026-03-30 07:54:19.92034+00	2026-03-30 07:54:19.92034+00	password	8eba044f-bc7e-4709-981d-c29b967d383c
7e034fa9-ed69-4c9e-9045-71e307f85701	2026-03-30 08:29:07.973339+00	2026-03-30 08:29:07.973339+00	password	37a47bda-7766-4dd9-b037-0335cd0e53d1
a661dd88-e6d0-44eb-9692-d32f3fd2a3cc	2026-03-30 08:40:16.903385+00	2026-03-30 08:40:16.903385+00	password	8703297d-f08b-499a-9254-2ead1cd29dfd
86951d66-bce5-4184-9612-23aa896c4274	2026-03-30 08:42:17.557232+00	2026-03-30 08:42:17.557232+00	password	a8abe8aa-b836-4292-a453-1e39cb0b0615
6d08e063-542b-4a08-8850-0da538569127	2026-03-30 09:49:49.266576+00	2026-03-30 09:49:49.266576+00	password	34d18133-7d70-4461-8186-7ca06acdcec9
6c309999-5de6-4971-a9e5-6d60f9164d78	2026-03-30 11:26:31.638438+00	2026-03-30 11:26:31.638438+00	password	e5b2e55e-7c3b-4b40-afd4-52d1aabdada6
2ae5bcdc-eb42-4779-bec0-7a761cb22638	2026-03-30 11:30:38.00035+00	2026-03-30 11:30:38.00035+00	password	3bc82c9c-975c-42ad-b093-08779194256f
a22f94b3-2082-469a-b443-d5012aff0811	2026-03-30 11:57:12.481992+00	2026-03-30 11:57:12.481992+00	password	e77f81eb-8b91-4378-b651-87c396c80a60
04427342-13e3-4329-946d-96be129a7c6f	2026-03-30 13:14:41.760309+00	2026-03-30 13:14:41.760309+00	password	22e637f3-4216-4946-a98e-902e9b53d140
dca166f5-97db-458b-b73f-b94fd6de2bfd	2026-03-30 13:22:03.857074+00	2026-03-30 13:22:03.857074+00	password	068d559c-e43c-4ae8-9456-e55be3792be4
6c5c7b52-a4c3-4c37-b891-427b9dfdac4e	2026-03-30 13:30:13.162871+00	2026-03-30 13:30:13.162871+00	password	aa5593da-07e0-49de-ad50-1b08ec718fae
94343b5d-10bb-4cfc-85fe-d8438628c64a	2026-03-30 13:48:22.856556+00	2026-03-30 13:48:22.856556+00	password	e26bad52-7658-4016-aa02-b1d944a65df5
0519d6d1-4310-4f32-9eef-c61ee575c78d	2026-03-30 17:21:21.7914+00	2026-03-30 17:21:21.7914+00	password	184e759d-c6ed-4def-b979-12fad225fe0a
b2b6dc1a-244e-4a11-97de-e0d5659b0b68	2026-03-30 21:08:17.918244+00	2026-03-30 21:08:17.918244+00	password	01b7948f-5b6c-4980-9f27-23d3ea78bb07
dd5f252b-92b7-4857-8e5f-78de53186db6	2026-03-30 21:09:24.732684+00	2026-03-30 21:09:24.732684+00	password	78047f72-6f20-4038-9b42-8f2ab17dcf75
2459e23f-3056-4e07-bf81-564def41e57d	2026-03-31 00:03:09.939433+00	2026-03-31 00:03:09.939433+00	password	f041ddc4-cc21-404d-8767-f19059e077a7
35735c02-c556-4759-9359-adc4f4baa246	2026-03-31 01:57:43.789824+00	2026-03-31 01:57:43.789824+00	password	2ff4d54d-724d-41c9-8afd-b90b30320ec7
de7bd133-72d1-4bbd-96a6-b22db1173cf9	2026-03-31 02:33:56.159065+00	2026-03-31 02:33:56.159065+00	password	10a8c76b-9c4d-42dd-b4be-c0dcce861f95
888356c7-c576-463e-b487-27ae3e3824e7	2026-03-31 03:08:35.898321+00	2026-03-31 03:08:35.898321+00	password	f5010f1e-994c-4217-b8d0-164ab69c77df
a2c9765e-c8d3-4cb3-b77f-e84115258479	2026-03-31 03:59:23.831801+00	2026-03-31 03:59:23.831801+00	password	b8a8bd82-7a91-47aa-962b-a6fa57f1928d
9e7bc1d2-e1bb-4504-b910-6af8792e665e	2026-03-31 06:09:59.316749+00	2026-03-31 06:09:59.316749+00	password	16793eec-c771-4c59-b130-dd10d582c976
9094b3e8-9ae6-4fad-ac7f-06d954fac04f	2026-03-31 08:41:38.951924+00	2026-03-31 08:41:38.951924+00	password	87741790-98ef-47e3-8148-d66f3d0c4fbc
2d771456-de74-485f-ace9-c87a686df8b8	2026-03-31 09:11:05.657723+00	2026-03-31 09:11:05.657723+00	password	03b41bde-f3bc-49a5-96c0-69469690d9bc
560d1784-f626-4e39-84f2-641d2cbc2fd9	2026-03-31 09:27:03.313608+00	2026-03-31 09:27:03.313608+00	password	4b85c82f-3619-468a-9f96-5f31971188c2
0a95378e-b2ef-4616-8c4e-7c7a51abc678	2026-03-31 10:16:05.281668+00	2026-03-31 10:16:05.281668+00	password	5f8090bb-0c55-4639-bfe4-26160b780fbc
8a9bff1b-89db-4fcd-9d13-1b63de2a6694	2026-03-31 10:24:44.252917+00	2026-03-31 10:24:44.252917+00	password	5c62595a-e861-4a5b-9af8-777d620cdda7
b8b59a5a-d476-4be4-8d77-5a4a7af04cba	2026-03-31 14:32:41.393173+00	2026-03-31 14:32:41.393173+00	password	b0f33bd9-b1d4-4d40-8158-cf45b686f66a
6bf4110a-0419-4105-a0f2-5d01cab3bdfd	2026-03-31 15:09:41.796777+00	2026-03-31 15:09:41.796777+00	password	c962842d-57af-4a56-9a7e-9ffb77200206
50482747-7228-4cee-a1d1-fc397161d261	2026-03-31 15:22:41.718837+00	2026-03-31 15:22:41.718837+00	password	80819b3b-f6bb-4116-9e02-92555cd91ce4
ff915bc1-4795-463a-b50e-33749da3a0b1	2026-03-31 15:27:20.806636+00	2026-03-31 15:27:20.806636+00	password	e083060a-18b1-49aa-8238-71c147665d62
ca849098-7c49-4f03-83fe-b2d425ba1705	2026-03-31 16:02:13.642974+00	2026-03-31 16:02:13.642974+00	password	49a4c19f-15dd-4c9d-96b3-a7f1a979c827
b83621fb-4d3b-4c0a-a922-42834e1a55c4	2026-03-31 16:19:18.901627+00	2026-03-31 16:19:18.901627+00	password	64f8f17f-7c0b-4372-8ede-22c807a22068
7db5e96c-452a-4c5f-b355-4ae23b0b7caf	2026-03-31 17:41:13.899051+00	2026-03-31 17:41:13.899051+00	password	8ca56fc9-b1cc-4d1f-bf98-3b7cb2ec8bca
f275af0e-0209-418f-8c81-d7ef81886d85	2026-04-01 01:41:16.192027+00	2026-04-01 01:41:16.192027+00	password	658cf1f8-6a15-40f0-a0c3-38548fcf6c39
26c3fd86-74c3-4e93-b54e-2b4d628cdecc	2026-04-01 02:44:29.051188+00	2026-04-01 02:44:29.051188+00	password	58a0a2da-7002-4dcd-84db-ade658eaa75f
470f633b-2aca-4415-b803-05f6589ea2b2	2026-04-01 05:41:37.806009+00	2026-04-01 05:41:37.806009+00	password	b29921e2-fb02-4608-b363-cc92e5e1c905
a41fff56-89c7-4826-aa8d-638f24c2d8e2	2026-04-01 08:59:15.514867+00	2026-04-01 08:59:15.514867+00	password	dc7330f4-9d7a-4519-905d-7d894fb85298
123fc6e3-ef7d-40c0-befc-ae7105a184a9	2026-04-01 10:23:08.290869+00	2026-04-01 10:23:08.290869+00	password	5671e53d-fb4d-41b6-a5a8-1bef92a57bf5
25082c96-9ef5-43d1-88e4-4d35b57bd97d	2026-04-01 10:33:48.678486+00	2026-04-01 10:33:48.678486+00	password	212795dd-7935-4111-9ff6-8443314288e9
25c78c30-4eb5-4b9c-b543-65b26c8b4758	2026-04-01 10:35:24.932224+00	2026-04-01 10:35:24.932224+00	password	b2d8a110-d4a9-43df-bf79-c716fc149550
6e097e48-836d-4849-a90f-a1ce2b3c80dd	2026-04-01 10:38:49.142633+00	2026-04-01 10:38:49.142633+00	password	1d6bf0fa-dda3-4a9c-8d07-398b76d8ac84
015efcb3-472c-4ef6-94eb-355726d63a81	2026-04-01 11:39:54.077286+00	2026-04-01 11:39:54.077286+00	password	5834eec0-5296-43dc-906c-2506b9fcceba
da366692-adc1-4ac4-abd9-4c2779d6cfa4	2026-04-01 11:45:49.188304+00	2026-04-01 11:45:49.188304+00	password	ffb0b0d7-01e6-47f7-9337-b454fe3b42f2
2668283d-50af-4120-971c-0714a8aa34c2	2026-04-01 12:36:02.574879+00	2026-04-01 12:36:02.574879+00	password	244f7f40-9351-4786-8666-2f7f7b00981b
1be46f6e-dca0-4c02-8547-8bdcb599c3e1	2026-04-01 13:42:40.962097+00	2026-04-01 13:42:40.962097+00	password	e8236bf9-1ad3-400e-902f-74eb14d9d982
add96c67-78be-4118-b771-fb8173fae889	2026-04-01 14:09:16.818735+00	2026-04-01 14:09:16.818735+00	password	fe8fb83a-aaac-40a6-a900-3e43ea479cb2
f3d563d2-fdcb-4947-9e57-93e589101945	2026-04-01 14:11:06.750282+00	2026-04-01 14:11:06.750282+00	password	ace2127a-089b-4a0d-892d-2af36d5235de
c8c67fd7-5fcd-4859-8d6b-ddc7b18bb179	2026-04-01 14:13:20.894918+00	2026-04-01 14:13:20.894918+00	password	dd6c1b89-27ab-450d-a61b-093bea0d3c01
5190e1f8-699a-470c-bc1f-cd512952492f	2026-04-01 14:13:30.358136+00	2026-04-01 14:13:30.358136+00	password	abb7cae1-e1f5-4a98-bfa8-615b5d9bb32f
9780424b-c5c7-4360-a829-0089698a11d6	2026-04-01 15:24:52.375169+00	2026-04-01 15:24:52.375169+00	password	a2867313-f34b-4bf3-ab93-36407ee713d8
14e2b0ae-ce08-419a-af73-7235f09b10f1	2026-04-01 16:00:00.74485+00	2026-04-01 16:00:00.74485+00	password	2e4cdd2c-2a86-4639-a3a7-fb7518906e92
70300518-a296-49ba-b58f-e0095d3af967	2026-04-01 16:02:52.478826+00	2026-04-01 16:02:52.478826+00	password	643672d1-dd2a-4f8d-8b11-3fb1b3b3c436
9944ac62-7a21-47f9-947c-5c2cb5cf8ce9	2026-04-02 00:18:52.801567+00	2026-04-02 00:18:52.801567+00	password	d3b41e96-8b93-494b-8a02-b8ccd9297eb2
387db9d7-cd6a-4f04-ac4f-20e32f4b9647	2026-04-02 01:01:14.571235+00	2026-04-02 01:01:14.571235+00	password	cb2f2299-41ea-421a-ad9a-ec849aaeb770
b0e9c90a-f642-463d-bc02-0bc93dae432c	2026-04-02 03:47:20.541122+00	2026-04-02 03:47:20.541122+00	password	03ddfe1a-b9bf-45ef-b6c9-308df96357d3
75c63164-b665-4493-bd22-0fd19691e92a	2026-04-02 03:48:54.780632+00	2026-04-02 03:48:54.780632+00	password	17400f18-e14c-4c96-b7c8-8932329835db
4adf3cb4-0821-427f-9b2e-773114c8de7e	2026-04-02 07:05:50.238661+00	2026-04-02 07:05:50.238661+00	password	5b2b55ac-e55e-4d09-b074-5058a63ceb86
01b505db-1243-4d4c-a0de-9e7a32fe17ce	2026-04-02 07:12:04.761078+00	2026-04-02 07:12:04.761078+00	password	13222ed2-c9e1-414d-8757-f41a32734404
7bc05121-7578-49a0-b428-1c30da66e2f1	2026-04-02 08:18:23.773063+00	2026-04-02 08:18:23.773063+00	password	90539406-e74c-4fc9-a739-accd078f12df
69fedcaa-6f85-4858-a305-682c7bbfa7ed	2026-04-02 08:18:36.46756+00	2026-04-02 08:18:36.46756+00	password	59f9da88-86da-46ba-9310-7f6f4ce0d4c1
ffe7510c-f66b-4cd7-8576-0bd0557c87af	2026-04-02 08:20:16.932279+00	2026-04-02 08:20:16.932279+00	password	da1b1fa3-a251-4f50-ad92-6ed7256cfdf5
959b45f2-7dcd-4132-aa87-7e4710aac541	2026-04-02 08:20:34.571534+00	2026-04-02 08:20:34.571534+00	password	61f94fee-8667-4342-af80-160a37c23281
9748f8c0-9e1e-4b0f-bd86-abc1297f4808	2026-04-02 08:25:09.135893+00	2026-04-02 08:25:09.135893+00	password	020b4169-d520-46f4-90d6-22ab1629cea3
d71b7602-fdc5-46d5-8327-2eeff5bca17a	2026-04-02 09:07:01.468843+00	2026-04-02 09:07:01.468843+00	password	1f3fb808-686a-4301-9842-9057986357bf
3bb2944b-7f3b-4f00-a4ba-20d125e3a3ab	2026-04-02 09:07:15.672872+00	2026-04-02 09:07:15.672872+00	password	10a2978f-96d1-47ae-afcd-093c150d25a3
fb564140-af79-4934-91a9-852c01635aa1	2026-04-02 09:17:04.752654+00	2026-04-02 09:17:04.752654+00	password	e11936c8-6603-4b52-b8ed-5262e458eb83
324673f4-31f5-4ef0-8aa3-3b6211d2c49a	2026-04-02 12:15:52.156999+00	2026-04-02 12:15:52.156999+00	password	5d37d943-3ac7-4ace-a933-1c02d4c77cb9
5daba084-9803-4227-8adf-5165c5433bbf	2026-04-02 14:26:17.487222+00	2026-04-02 14:26:17.487222+00	password	12771663-d36f-429b-8233-5378190f9d74
f60120f9-3de5-4305-a2fa-a5c410f95b80	2026-04-02 15:01:55.686837+00	2026-04-02 15:01:55.686837+00	password	266ebad3-e4f9-42f7-bc64-25c8469529c2
f248ccf2-7b6a-4725-b887-e908aadb4b84	2026-04-02 15:04:30.679097+00	2026-04-02 15:04:30.679097+00	password	fb7bb3e6-69c2-44e1-bc79-89fa5a4003c6
b6deff39-d859-437b-abb1-5e830960e552	2026-04-02 15:05:45.053268+00	2026-04-02 15:05:45.053268+00	password	04e580eb-fd39-4635-8e41-d2299a9e4392
5d2143ce-9104-4fc7-b69a-d81a90f032e7	2026-04-02 15:06:41.386998+00	2026-04-02 15:06:41.386998+00	password	a7a917bf-788a-4f61-8f5b-3dd1e6cd37e4
b4276e1f-b06c-4e59-ba57-01aac8189d63	2026-04-02 15:08:13.482828+00	2026-04-02 15:08:13.482828+00	password	68e5908c-53d9-4650-8984-13326bfdfa9a
68b4cdd9-5b07-4e3f-a86c-bc5497fad4c9	2026-04-02 15:08:17.920143+00	2026-04-02 15:08:17.920143+00	password	364cb07e-eadf-4ff7-8c22-8b9f8ae11d83
c84e5c0e-541c-4bc2-87ec-1d7cb967c52d	2026-04-02 15:15:08.573726+00	2026-04-02 15:15:08.573726+00	password	dfe62af2-c3a2-4452-8f80-9b5447c3879f
ef646cb2-a212-4fa0-b0e4-f082031ee847	2026-04-02 15:30:08.309747+00	2026-04-02 15:30:08.309747+00	password	925d8cc5-f2f3-4214-8949-7ec930b9bf0f
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid, last_webauthn_challenge_data) FROM stdin;
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_authorizations (id, authorization_id, client_id, user_id, redirect_uri, scope, state, resource, code_challenge, code_challenge_method, response_type, status, authorization_code, created_at, expires_at, approved_at, nonce) FROM stdin;
\.


--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_client_states (id, provider_type, code_verifier, created_at) FROM stdin;
\.


--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_consents (id, user_id, client_id, scopes, granted_at, revoked_at) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
00000000-0000-0000-0000-000000000000	1	ejwqkuvk2aii	70f406c8-985c-4b16-af6d-68481e60bf32	f	2026-03-29 07:04:45.900124+00	2026-03-29 07:04:45.900124+00	\N	15af2960-f442-49d3-a1cb-6f2962bc379f
00000000-0000-0000-0000-000000000000	39	s34dwg3ro27n	59528fbf-7da5-4b93-ac63-578c212f9849	t	2026-03-29 15:05:41.47428+00	2026-03-30 07:11:29.998892+00	fv5xtsn2c44n	d159e928-1537-4a58-a0c9-af94bc94fd18
00000000-0000-0000-0000-000000000000	3	wndy63umqgpi	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-03-29 07:13:51.807817+00	2026-03-29 08:11:57.306356+00	\N	b7a287cd-7143-443d-8241-10101347cc9a
00000000-0000-0000-0000-000000000000	110	vdkr3idhknqz	03ab5ebc-36bf-4cf6-948c-4f86ffdbbde3	f	2026-03-30 07:29:56.447963+00	2026-03-30 07:29:56.447963+00	vzkwwbss7z33	fe4d8b6a-ff63-40d5-bd4f-35730b805b5d
00000000-0000-0000-0000-000000000000	5	ul7v6zs7adxv	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-03-29 08:11:57.317854+00	2026-03-29 09:10:27.334867+00	wndy63umqgpi	b7a287cd-7143-443d-8241-10101347cc9a
00000000-0000-0000-0000-000000000000	24	2ifpspqdn26b	4e949fa0-c160-4a4c-8e5b-dcb87426fddb	t	2026-03-29 12:45:36.587218+00	2026-03-30 07:38:44.892798+00	\N	dd34715a-fa6e-48b0-9b21-7cc1aed29106
00000000-0000-0000-0000-000000000000	7	2zkenqtzx6za	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-03-29 09:10:27.352787+00	2026-03-29 10:08:57.274904+00	ul7v6zs7adxv	b7a287cd-7143-443d-8241-10101347cc9a
00000000-0000-0000-0000-000000000000	33	342igtqt6ch4	4e949fa0-c160-4a4c-8e5b-dcb87426fddb	t	2026-03-29 14:26:35.728216+00	2026-03-30 07:46:13.093327+00	\N	56d4e5e4-5ceb-41fb-bb76-1f484baa5b59
00000000-0000-0000-0000-000000000000	107	bhlagthr4pge	59528fbf-7da5-4b93-ac63-578c212f9849	t	2026-03-30 07:11:30.027792+00	2026-03-30 08:16:35.778062+00	s34dwg3ro27n	d159e928-1537-4a58-a0c9-af94bc94fd18
00000000-0000-0000-0000-000000000000	109	uemtw7fqesva	49f749b7-6973-463f-a122-22748aa7da8f	t	2026-03-30 07:24:49.009056+00	2026-03-30 08:23:19.155984+00	i6obz2nupfuk	b67b55db-428a-4863-ba01-3f62839ebd23
00000000-0000-0000-0000-000000000000	105	f5yv4l6tz7fw	17640674-04f2-4b1c-b065-4b56a68e595b	t	2026-03-30 06:36:16.316555+00	2026-03-30 08:41:51.397668+00	m5g2m5xogz5s	9d325d84-e10e-4f68-9099-f7293245ff0a
00000000-0000-0000-0000-000000000000	8	qs5jqm5bnbi5	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-03-29 10:08:57.290843+00	2026-03-29 11:07:40.155804+00	2zkenqtzx6za	b7a287cd-7143-443d-8241-10101347cc9a
00000000-0000-0000-0000-000000000000	45	gczskepotfnd	f80c971a-5a82-4ced-83fb-1ee295a252b3	t	2026-03-29 15:35:31.206145+00	2026-03-30 09:49:40.789192+00	ohrjen3lrliw	0a53a346-b798-4955-8256-31083cb30c74
00000000-0000-0000-0000-000000000000	28	6zq3e5k2zijz	afc33010-fcb8-4cf4-a75b-23bbb096f014	t	2026-03-29 13:23:35.033386+00	2026-03-30 10:36:29.129099+00	\N	edb0eaa0-2395-47e7-94e9-b7285e70518e
00000000-0000-0000-0000-000000000000	11	rr63ji7jygxq	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-03-29 11:07:40.172273+00	2026-03-29 12:06:02.188816+00	qs5jqm5bnbi5	b7a287cd-7143-443d-8241-10101347cc9a
00000000-0000-0000-0000-000000000000	18	sidknwkgow3k	5240aafe-ff7c-4038-9970-4563f64928ec	t	2026-03-29 12:23:24.74475+00	2026-03-30 10:52:01.250901+00	a4yd75g54rgp	8925e2f2-fdf1-4699-aba7-bd3c5bbd5363
00000000-0000-0000-0000-000000000000	50	2k3rgw63wy6o	b6d69be7-f77a-4873-bd82-425ca563d6f1	t	2026-03-29 16:09:57.136918+00	2026-03-31 06:59:47.909432+00	llky7xfn6gow	24091b0a-3979-4f69-9039-6d8b1ae844a0
00000000-0000-0000-0000-000000000000	46	b5dv4hbausmb	9e557ae3-2517-43c7-80df-2700ec910ec5	t	2026-03-29 15:35:52.858263+00	2026-03-31 09:10:53.610655+00	oap367fsqe6x	7bf94147-dbf7-458b-bd18-3164266434c6
00000000-0000-0000-0000-000000000000	10	a4yd75g54rgp	5240aafe-ff7c-4038-9970-4563f64928ec	t	2026-03-29 11:01:48.735466+00	2026-03-29 12:23:24.730037+00	\N	8925e2f2-fdf1-4699-aba7-bd3c5bbd5363
00000000-0000-0000-0000-000000000000	21	o5t747mmkflo	237593b0-b857-4f0e-81fc-448f838e3ba6	f	2026-03-29 12:37:47.536661+00	2026-03-29 12:37:47.536661+00	\N	24e160f3-a753-4a96-a31a-9b2443ea02fd
00000000-0000-0000-0000-000000000000	12	oxldlz7r7bfx	b6d69be7-f77a-4873-bd82-425ca563d6f1	t	2026-03-29 11:31:40.512043+00	2026-03-29 12:41:44.931936+00	\N	24091b0a-3979-4f69-9039-6d8b1ae844a0
00000000-0000-0000-0000-000000000000	16	tf4wz5yqxlhc	8bc43a7a-c98b-42c5-91ee-1e421c2aaf92	t	2026-03-29 12:19:31.661872+00	2026-03-29 13:17:33.634906+00	\N	ffe71664-9463-49e4-b049-c0cc08447131
00000000-0000-0000-0000-000000000000	20	ctp4uynhbzsi	f80c971a-5a82-4ced-83fb-1ee295a252b3	t	2026-03-29 12:27:02.299639+00	2026-03-29 13:36:06.312544+00	\N	95b4bc3f-cd31-4138-ba1c-f20c620d0ba8
00000000-0000-0000-0000-000000000000	29	3rzp2pkxjcb3	f80c971a-5a82-4ced-83fb-1ee295a252b3	f	2026-03-29 13:36:06.329872+00	2026-03-29 13:36:06.329872+00	ctp4uynhbzsi	95b4bc3f-cd31-4138-ba1c-f20c620d0ba8
00000000-0000-0000-0000-000000000000	22	ggij2fcnm3nt	b6d69be7-f77a-4873-bd82-425ca563d6f1	t	2026-03-29 12:41:44.947515+00	2026-03-29 13:43:19.562385+00	oxldlz7r7bfx	24091b0a-3979-4f69-9039-6d8b1ae844a0
00000000-0000-0000-0000-000000000000	13	e5euxrmpp4ky	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-03-29 12:06:02.204229+00	2026-03-29 14:10:53.062602+00	rr63ji7jygxq	b7a287cd-7143-443d-8241-10101347cc9a
00000000-0000-0000-0000-000000000000	25	bmllu2wfvvvg	9e557ae3-2517-43c7-80df-2700ec910ec5	t	2026-03-29 13:15:05.292136+00	2026-03-29 14:28:23.575421+00	\N	7bf94147-dbf7-458b-bd18-3164266434c6
00000000-0000-0000-0000-000000000000	35	i2kefxtsgvh6	f80c971a-5a82-4ced-83fb-1ee295a252b3	f	2026-03-29 14:29:55.191956+00	2026-03-29 14:29:55.191956+00	\N	4e081d86-45f8-4801-a57c-9629bd96e56d
00000000-0000-0000-0000-000000000000	37	a7ep5ifvxeip	dcdd1ff2-fc86-4a07-9d88-74e8c21c8be2	f	2026-03-29 14:52:08.129904+00	2026-03-29 14:52:08.129904+00	\N	84449ce7-59c9-4ea4-8b89-80167f02ec63
00000000-0000-0000-0000-000000000000	27	fv5xtsn2c44n	59528fbf-7da5-4b93-ac63-578c212f9849	t	2026-03-29 13:22:15.319175+00	2026-03-29 15:05:41.453694+00	\N	d159e928-1537-4a58-a0c9-af94bc94fd18
00000000-0000-0000-0000-000000000000	32	ojnymyywsowr	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-03-29 14:10:53.07927+00	2026-03-29 15:09:22.159996+00	e5euxrmpp4ky	b7a287cd-7143-443d-8241-10101347cc9a
00000000-0000-0000-0000-000000000000	30	szfrkuh5gvzx	b6d69be7-f77a-4873-bd82-425ca563d6f1	t	2026-03-29 13:43:19.563488+00	2026-03-29 15:12:05.635772+00	ggij2fcnm3nt	24091b0a-3979-4f69-9039-6d8b1ae844a0
00000000-0000-0000-0000-000000000000	26	b523peohyk4q	8bc43a7a-c98b-42c5-91ee-1e421c2aaf92	t	2026-03-29 13:17:33.655353+00	2026-03-29 15:16:19.704916+00	tf4wz5yqxlhc	ffe71664-9463-49e4-b049-c0cc08447131
00000000-0000-0000-0000-000000000000	36	ohrjen3lrliw	f80c971a-5a82-4ced-83fb-1ee295a252b3	t	2026-03-29 14:30:54.278931+00	2026-03-29 15:35:31.190374+00	\N	0a53a346-b798-4955-8256-31083cb30c74
00000000-0000-0000-0000-000000000000	34	oap367fsqe6x	9e557ae3-2517-43c7-80df-2700ec910ec5	t	2026-03-29 14:28:23.597402+00	2026-03-29 15:35:52.834227+00	bmllu2wfvvvg	7bf94147-dbf7-458b-bd18-3164266434c6
00000000-0000-0000-0000-000000000000	15	ndw4rae5yaqe	49f749b7-6973-463f-a122-22748aa7da8f	t	2026-03-29 12:18:29.610878+00	2026-03-29 15:35:53.486567+00	\N	b67b55db-428a-4863-ba01-3f62839ebd23
00000000-0000-0000-0000-000000000000	4	7ad2vkupbcu2	70f406c8-985c-4b16-af6d-68481e60bf32	t	2026-03-29 07:34:03.637651+00	2026-03-29 15:44:25.262871+00	\N	9ca2375a-2527-4278-a9e2-1886f3eccfc7
00000000-0000-0000-0000-000000000000	41	tsrxpxyaq3nb	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-03-29 15:09:22.160378+00	2026-03-29 16:07:48.836516+00	ojnymyywsowr	b7a287cd-7143-443d-8241-10101347cc9a
00000000-0000-0000-0000-000000000000	42	llky7xfn6gow	b6d69be7-f77a-4873-bd82-425ca563d6f1	t	2026-03-29 15:12:05.644591+00	2026-03-29 16:09:57.123513+00	szfrkuh5gvzx	24091b0a-3979-4f69-9039-6d8b1ae844a0
00000000-0000-0000-0000-000000000000	51	asrrueobth3n	17640674-04f2-4b1c-b065-4b56a68e595b	f	2026-03-29 16:24:44.23349+00	2026-03-29 16:24:44.23349+00	\N	65f9c1a6-44c8-4f32-9ba4-d85b0f0f4859
00000000-0000-0000-0000-000000000000	48	xdwjorrtotln	70f406c8-985c-4b16-af6d-68481e60bf32	t	2026-03-29 15:44:25.280678+00	2026-03-29 16:42:55.121101+00	7ad2vkupbcu2	9ca2375a-2527-4278-a9e2-1886f3eccfc7
00000000-0000-0000-0000-000000000000	49	7rrmxl5tuvno	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-03-29 16:07:48.855873+00	2026-03-29 17:06:12.010594+00	tsrxpxyaq3nb	b7a287cd-7143-443d-8241-10101347cc9a
00000000-0000-0000-0000-000000000000	47	yku2tvt6j6mb	49f749b7-6973-463f-a122-22748aa7da8f	t	2026-03-29 15:35:53.487643+00	2026-03-29 23:42:20.290259+00	ndw4rae5yaqe	b67b55db-428a-4863-ba01-3f62839ebd23
00000000-0000-0000-0000-000000000000	38	42kiycvkjl5p	dcdd1ff2-fc86-4a07-9d88-74e8c21c8be2	t	2026-03-29 14:55:21.812589+00	2026-03-30 01:54:51.524382+00	\N	7608888a-b6e7-4c00-8866-6ab0c2bf962d
00000000-0000-0000-0000-000000000000	17	hssajcknhccl	7f569eac-1fb2-4c5a-9074-ca5fa50d3724	t	2026-03-29 12:20:06.297883+00	2026-03-30 02:19:17.778399+00	\N	4094b92b-0ef3-4c8a-b975-a939c021d0da
00000000-0000-0000-0000-000000000000	14	2uiqsmbd475a	17640674-04f2-4b1c-b065-4b56a68e595b	t	2026-03-29 12:18:21.326395+00	2026-03-30 03:30:59.187083+00	\N	49aaa0be-0b6f-475f-be2c-91ebd87f6f4b
00000000-0000-0000-0000-000000000000	43	swrxgxgv3czq	8bc43a7a-c98b-42c5-91ee-1e421c2aaf92	t	2026-03-29 15:16:19.709892+00	2026-03-30 04:09:54.011384+00	b523peohyk4q	ffe71664-9463-49e4-b049-c0cc08447131
00000000-0000-0000-0000-000000000000	53	dflpodl73d3h	9e557ae3-2517-43c7-80df-2700ec910ec5	f	2026-03-29 16:26:18.216067+00	2026-03-29 16:26:18.216067+00	\N	a0ecbd90-93be-48a2-9645-3f7b3eaa103b
00000000-0000-0000-0000-000000000000	54	cgwkh2agcd26	b6d69be7-f77a-4873-bd82-425ca563d6f1	f	2026-03-29 16:27:48.718647+00	2026-03-29 16:27:48.718647+00	\N	8a7a9b0e-6a67-444f-b666-189b343fb199
00000000-0000-0000-0000-000000000000	55	om2bzroo5yio	03c2a3c3-197e-45a0-a67d-95fc4288d21b	f	2026-03-29 16:29:31.005157+00	2026-03-29 16:29:31.005157+00	\N	2c0f8d5c-1db4-46d9-8fed-8980bfc29e3e
00000000-0000-0000-0000-000000000000	98	m5g2m5xogz5s	17640674-04f2-4b1c-b065-4b56a68e595b	t	2026-03-30 05:20:04.708296+00	2026-03-30 06:36:16.302552+00	\N	9d325d84-e10e-4f68-9099-f7293245ff0a
00000000-0000-0000-0000-000000000000	99	ksufvzvvpr4j	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-03-30 05:44:16.31569+00	2026-03-30 06:42:46.683197+00	scmx2izvun5k	b7a287cd-7143-443d-8241-10101347cc9a
00000000-0000-0000-0000-000000000000	106	4ztmsw6jks4z	03c2a3c3-197e-45a0-a67d-95fc4288d21b	f	2026-03-30 06:42:46.687711+00	2026-03-30 06:42:46.687711+00	ksufvzvvpr4j	b7a287cd-7143-443d-8241-10101347cc9a
00000000-0000-0000-0000-000000000000	61	7eke67r2renp	70f406c8-985c-4b16-af6d-68481e60bf32	t	2026-03-29 17:41:24.960543+00	2026-03-30 07:22:29.313506+00	fdz3msgobddz	9ca2375a-2527-4278-a9e2-1886f3eccfc7
00000000-0000-0000-0000-000000000000	56	otw4mdji3wpu	b6d69be7-f77a-4873-bd82-425ca563d6f1	t	2026-03-29 16:31:00.580674+00	2026-03-29 17:29:13.574323+00	\N	c2e43bcf-bfbc-454f-9829-bcd373ec0efa
00000000-0000-0000-0000-000000000000	58	fdz3msgobddz	70f406c8-985c-4b16-af6d-68481e60bf32	t	2026-03-29 16:42:55.137937+00	2026-03-29 17:41:24.937062+00	xdwjorrtotln	9ca2375a-2527-4278-a9e2-1886f3eccfc7
00000000-0000-0000-0000-000000000000	57	yzzkusmax5cl	b6d69be7-f77a-4873-bd82-425ca563d6f1	t	2026-03-29 16:39:25.533237+00	2026-03-29 18:02:00.52644+00	\N	5c13d680-de01-48f2-b5f3-40f0cf08a8c0
00000000-0000-0000-0000-000000000000	59	nnsnd5wmqewy	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-03-29 17:06:12.078896+00	2026-03-29 18:04:37.158044+00	7rrmxl5tuvno	b7a287cd-7143-443d-8241-10101347cc9a
00000000-0000-0000-0000-000000000000	104	i6obz2nupfuk	49f749b7-6973-463f-a122-22748aa7da8f	t	2026-03-30 06:26:36.92521+00	2026-03-30 07:24:48.994696+00	zfrmkhxula4y	b67b55db-428a-4863-ba01-3f62839ebd23
00000000-0000-0000-0000-000000000000	63	tj2tpzpbwap4	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-03-29 18:04:37.173302+00	2026-03-29 19:03:07.088417+00	nnsnd5wmqewy	b7a287cd-7143-443d-8241-10101347cc9a
00000000-0000-0000-0000-000000000000	103	vzkwwbss7z33	03ab5ebc-36bf-4cf6-948c-4f86ffdbbde3	t	2026-03-30 06:25:05.176791+00	2026-03-30 07:29:56.429175+00	\N	fe4d8b6a-ff63-40d5-bd4f-35730b805b5d
00000000-0000-0000-0000-000000000000	64	beym5wpevlr5	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-03-29 19:03:07.101092+00	2026-03-29 20:01:37.255687+00	tj2tpzpbwap4	b7a287cd-7143-443d-8241-10101347cc9a
00000000-0000-0000-0000-000000000000	100	cf4elpenvj3p	8bc43a7a-c98b-42c5-91ee-1e421c2aaf92	t	2026-03-30 05:55:03.897852+00	2026-03-30 08:03:16.798054+00	senglwypn7nx	ffe71664-9463-49e4-b049-c0cc08447131
00000000-0000-0000-0000-000000000000	65	vdrs5kyhfuoo	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-03-29 20:01:37.274528+00	2026-03-29 21:00:07.045603+00	beym5wpevlr5	b7a287cd-7143-443d-8241-10101347cc9a
00000000-0000-0000-0000-000000000000	60	7up4algap3jg	b6d69be7-f77a-4873-bd82-425ca563d6f1	t	2026-03-29 17:29:13.590951+00	2026-03-30 08:27:19.817393+00	otw4mdji3wpu	c2e43bcf-bfbc-454f-9829-bcd373ec0efa
00000000-0000-0000-0000-000000000000	66	msfmlpmsp7df	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-03-29 21:00:07.061464+00	2026-03-29 21:58:37.118176+00	vdrs5kyhfuoo	b7a287cd-7143-443d-8241-10101347cc9a
00000000-0000-0000-0000-000000000000	108	hgykcbeq4aph	70f406c8-985c-4b16-af6d-68481e60bf32	t	2026-03-30 07:22:29.326019+00	2026-03-30 11:00:04.857884+00	7eke67r2renp	9ca2375a-2527-4278-a9e2-1886f3eccfc7
00000000-0000-0000-0000-000000000000	67	f6uwltj6tg4g	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-03-29 21:58:37.134967+00	2026-03-29 22:57:07.046156+00	msfmlpmsp7df	b7a287cd-7143-443d-8241-10101347cc9a
00000000-0000-0000-0000-000000000000	74	4rlricqdh5aw	b6d69be7-f77a-4873-bd82-425ca563d6f1	t	2026-03-30 01:16:43.671102+00	2026-03-31 01:08:25.853398+00	jzftwh5jhzdc	5c13d680-de01-48f2-b5f3-40f0cf08a8c0
00000000-0000-0000-0000-000000000000	68	2sndstpnfvfb	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-03-29 22:57:07.061717+00	2026-03-29 23:55:36.987029+00	f6uwltj6tg4g	b7a287cd-7143-443d-8241-10101347cc9a
00000000-0000-0000-0000-000000000000	70	g66fx64kug6k	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-03-29 23:55:37.000315+00	2026-03-30 00:53:46.724463+00	2sndstpnfvfb	b7a287cd-7143-443d-8241-10101347cc9a
00000000-0000-0000-0000-000000000000	62	jzftwh5jhzdc	b6d69be7-f77a-4873-bd82-425ca563d6f1	t	2026-03-29 18:02:00.538271+00	2026-03-30 01:16:43.638493+00	yzzkusmax5cl	5c13d680-de01-48f2-b5f3-40f0cf08a8c0
00000000-0000-0000-0000-000000000000	72	gjjp7gzsyy2k	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-03-30 00:53:46.745907+00	2026-03-30 01:51:46.813767+00	g66fx64kug6k	b7a287cd-7143-443d-8241-10101347cc9a
00000000-0000-0000-0000-000000000000	77	ek2ufamzndml	03ab5ebc-36bf-4cf6-948c-4f86ffdbbde3	f	2026-03-30 01:51:50.426365+00	2026-03-30 01:51:50.426365+00	\N	57c9a63c-ca13-4556-8175-4cf991738694
00000000-0000-0000-0000-000000000000	78	6braq466vbt5	dcdd1ff2-fc86-4a07-9d88-74e8c21c8be2	f	2026-03-30 01:54:51.544905+00	2026-03-30 01:54:51.544905+00	42kiycvkjl5p	7608888a-b6e7-4c00-8866-6ab0c2bf962d
00000000-0000-0000-0000-000000000000	69	4m4vszlyrqfr	49f749b7-6973-463f-a122-22748aa7da8f	t	2026-03-29 23:42:20.307551+00	2026-03-30 02:19:33.344174+00	yku2tvt6j6mb	b67b55db-428a-4863-ba01-3f62839ebd23
00000000-0000-0000-0000-000000000000	83	fu3xjjrxj66d	5240aafe-ff7c-4038-9970-4563f64928ec	f	2026-03-30 02:36:41.825482+00	2026-03-30 02:36:41.825482+00	\N	be456bc8-7917-4ada-9c83-08f7abd06067
00000000-0000-0000-0000-000000000000	76	ceqfbzja6ssl	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-03-30 01:51:46.843515+00	2026-03-30 02:49:46.687597+00	gjjp7gzsyy2k	b7a287cd-7143-443d-8241-10101347cc9a
00000000-0000-0000-0000-000000000000	81	ncglrpqenwud	49f749b7-6973-463f-a122-22748aa7da8f	t	2026-03-30 02:19:33.354926+00	2026-03-30 03:17:35.90531+00	4m4vszlyrqfr	b67b55db-428a-4863-ba01-3f62839ebd23
00000000-0000-0000-0000-000000000000	87	feggse7rhgte	17640674-04f2-4b1c-b065-4b56a68e595b	f	2026-03-30 03:30:59.199782+00	2026-03-30 03:30:59.199782+00	2uiqsmbd475a	49aaa0be-0b6f-475f-be2c-91ebd87f6f4b
00000000-0000-0000-0000-000000000000	88	qaq4zwpuyale	17640674-04f2-4b1c-b065-4b56a68e595b	f	2026-03-30 03:31:01.605528+00	2026-03-30 03:31:01.605528+00	\N	9ed5bb15-15d0-4144-b0fb-eba3a706ad88
00000000-0000-0000-0000-000000000000	84	byijiuwqn6un	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-03-30 02:49:46.711715+00	2026-03-30 03:47:46.574527+00	ceqfbzja6ssl	b7a287cd-7143-443d-8241-10101347cc9a
00000000-0000-0000-0000-000000000000	80	sa7toyw6ht52	7f569eac-1fb2-4c5a-9074-ca5fa50d3724	t	2026-03-30 02:19:17.79565+00	2026-03-30 04:15:33.499367+00	hssajcknhccl	4094b92b-0ef3-4c8a-b975-a939c021d0da
00000000-0000-0000-0000-000000000000	92	4pbsswkcpu64	7f569eac-1fb2-4c5a-9074-ca5fa50d3724	f	2026-03-30 04:15:33.519174+00	2026-03-30 04:15:33.519174+00	sa7toyw6ht52	4094b92b-0ef3-4c8a-b975-a939c021d0da
00000000-0000-0000-0000-000000000000	86	th7lpgy32ter	49f749b7-6973-463f-a122-22748aa7da8f	t	2026-03-30 03:17:35.924171+00	2026-03-30 04:15:35.737466+00	ncglrpqenwud	b67b55db-428a-4863-ba01-3f62839ebd23
00000000-0000-0000-0000-000000000000	90	2eud4g4gjaev	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-03-30 03:47:46.592948+00	2026-03-30 04:45:48.878496+00	byijiuwqn6un	b7a287cd-7143-443d-8241-10101347cc9a
00000000-0000-0000-0000-000000000000	93	qmz2g5dhvrfa	49f749b7-6973-463f-a122-22748aa7da8f	t	2026-03-30 04:15:35.737971+00	2026-03-30 05:13:36.200994+00	th7lpgy32ter	b67b55db-428a-4863-ba01-3f62839ebd23
00000000-0000-0000-0000-000000000000	89	nuxqqe3aivlw	17640674-04f2-4b1c-b065-4b56a68e595b	t	2026-03-30 03:31:49.978519+00	2026-03-30 05:15:16.771599+00	\N	9889f5bb-d775-4f67-8c50-2fa92898f7b4
00000000-0000-0000-0000-000000000000	97	uzs3ytxz35j3	17640674-04f2-4b1c-b065-4b56a68e595b	f	2026-03-30 05:15:16.77873+00	2026-03-30 05:15:16.77873+00	nuxqqe3aivlw	9889f5bb-d775-4f67-8c50-2fa92898f7b4
00000000-0000-0000-0000-000000000000	95	scmx2izvun5k	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-03-30 04:45:48.894456+00	2026-03-30 05:44:16.242751+00	2eud4g4gjaev	b7a287cd-7143-443d-8241-10101347cc9a
00000000-0000-0000-0000-000000000000	91	senglwypn7nx	8bc43a7a-c98b-42c5-91ee-1e421c2aaf92	t	2026-03-30 04:09:54.024095+00	2026-03-30 05:55:03.881864+00	swrxgxgv3czq	ffe71664-9463-49e4-b049-c0cc08447131
00000000-0000-0000-0000-000000000000	79	l63zhvtkwzvw	03ab5ebc-36bf-4cf6-948c-4f86ffdbbde3	t	2026-03-30 02:07:37.969271+00	2026-03-30 06:25:02.66452+00	\N	078d8b02-4933-4040-ab1b-dca1e7d6b659
00000000-0000-0000-0000-000000000000	102	nengfj523cck	03ab5ebc-36bf-4cf6-948c-4f86ffdbbde3	f	2026-03-30 06:25:02.667429+00	2026-03-30 06:25:02.667429+00	l63zhvtkwzvw	078d8b02-4933-4040-ab1b-dca1e7d6b659
00000000-0000-0000-0000-000000000000	96	zfrmkhxula4y	49f749b7-6973-463f-a122-22748aa7da8f	t	2026-03-30 05:13:36.224632+00	2026-03-30 06:26:36.917747+00	qmz2g5dhvrfa	b67b55db-428a-4863-ba01-3f62839ebd23
00000000-0000-0000-0000-000000000000	113	zhrfctfeqaly	4e949fa0-c160-4a4c-8e5b-dcb87426fddb	f	2026-03-30 07:38:44.906649+00	2026-03-30 07:38:44.906649+00	2ifpspqdn26b	dd34715a-fa6e-48b0-9b21-7cc1aed29106
00000000-0000-0000-0000-000000000000	114	edx7oiskd55b	4e949fa0-c160-4a4c-8e5b-dcb87426fddb	f	2026-03-30 07:46:13.106812+00	2026-03-30 07:46:13.106812+00	342igtqt6ch4	56d4e5e4-5ceb-41fb-bb76-1f484baa5b59
00000000-0000-0000-0000-000000000000	115	e3flx5gkyevl	4e949fa0-c160-4a4c-8e5b-dcb87426fddb	f	2026-03-30 07:46:16.042051+00	2026-03-30 07:46:16.042051+00	\N	40929eb6-b900-4494-807d-a5e744b6fbc6
00000000-0000-0000-0000-000000000000	117	boa2yi5xv37r	4e949fa0-c160-4a4c-8e5b-dcb87426fddb	f	2026-03-30 07:47:56.592329+00	2026-03-30 07:47:56.592329+00	\N	1b0240eb-d187-42b0-bc71-4282880de07d
00000000-0000-0000-0000-000000000000	154	mfbz3ivh3i6e	4e949fa0-c160-4a4c-8e5b-dcb87426fddb	t	2026-03-30 13:25:54.668877+00	2026-04-01 14:01:25.491517+00	rzqxrhonut3l	10dca00a-5227-40f5-ab4c-6271cb2280d2
00000000-0000-0000-0000-000000000000	118	ynwu2lnt5b3o	4e949fa0-c160-4a4c-8e5b-dcb87426fddb	t	2026-03-30 07:54:19.894507+00	2026-04-02 15:31:04.813794+00	\N	3af8f97b-d6cb-414e-9aff-e5ba3bc919aa
00000000-0000-0000-0000-000000000000	122	imapu7hvq2sw	b6d69be7-f77a-4873-bd82-425ca563d6f1	f	2026-03-30 08:27:19.825893+00	2026-03-30 08:27:19.825893+00	7up4algap3jg	c2e43bcf-bfbc-454f-9829-bcd373ec0efa
00000000-0000-0000-0000-000000000000	111	bkslccspcwoj	03ab5ebc-36bf-4cf6-948c-4f86ffdbbde3	t	2026-03-30 07:29:58.420031+00	2026-03-30 08:28:01.939669+00	\N	33cab24d-b467-4e37-9385-dbbd97a005d1
00000000-0000-0000-0000-000000000000	112	lcfcex62ayd7	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-03-30 07:30:20.178426+00	2026-03-30 08:28:37.282999+00	\N	bbdcd7c2-0745-4225-bf47-6f29e7061bba
00000000-0000-0000-0000-000000000000	125	4o56dibh2gqi	b6d69be7-f77a-4873-bd82-425ca563d6f1	f	2026-03-30 08:29:07.971636+00	2026-03-30 08:29:07.971636+00	\N	7e034fa9-ed69-4c9e-9045-71e307f85701
00000000-0000-0000-0000-000000000000	127	amixaa6fhuno	9e557ae3-2517-43c7-80df-2700ec910ec5	f	2026-03-30 08:40:16.879466+00	2026-03-30 08:40:16.879466+00	\N	a661dd88-e6d0-44eb-9692-d32f3fd2a3cc
00000000-0000-0000-0000-000000000000	129	ux5lisrft5pd	17640674-04f2-4b1c-b065-4b56a68e595b	f	2026-03-30 08:42:17.534003+00	2026-03-30 08:42:17.534003+00	\N	86951d66-bce5-4184-9612-23aa896c4274
00000000-0000-0000-0000-000000000000	121	zbencpnmrnnk	49f749b7-6973-463f-a122-22748aa7da8f	t	2026-03-30 08:23:19.167511+00	2026-03-30 09:21:49.17267+00	uemtw7fqesva	b67b55db-428a-4863-ba01-3f62839ebd23
00000000-0000-0000-0000-000000000000	124	5rdccc6hho4q	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-03-30 08:28:37.283413+00	2026-03-30 09:27:07.641783+00	lcfcex62ayd7	bbdcd7c2-0745-4225-bf47-6f29e7061bba
00000000-0000-0000-0000-000000000000	132	eysbx4p2zrdp	f80c971a-5a82-4ced-83fb-1ee295a252b3	f	2026-03-30 09:49:40.804688+00	2026-03-30 09:49:40.804688+00	gczskepotfnd	0a53a346-b798-4955-8256-31083cb30c74
00000000-0000-0000-0000-000000000000	131	kpgcigjpuvub	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-03-30 09:27:07.651958+00	2026-03-30 10:25:37.617403+00	5rdccc6hho4q	bbdcd7c2-0745-4225-bf47-6f29e7061bba
00000000-0000-0000-0000-000000000000	137	n4572ayhzu2k	5240aafe-ff7c-4038-9970-4563f64928ec	f	2026-03-30 10:52:01.272457+00	2026-03-30 10:52:01.272457+00	sidknwkgow3k	8925e2f2-fdf1-4699-aba7-bd3c5bbd5363
00000000-0000-0000-0000-000000000000	116	2i3bcgbqgms4	4e949fa0-c160-4a4c-8e5b-dcb87426fddb	t	2026-03-30 07:46:39.157867+00	2026-03-30 11:00:27.089235+00	\N	10dca00a-5227-40f5-ab4c-6271cb2280d2
00000000-0000-0000-0000-000000000000	135	6ydwo4oi5j7u	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-03-30 10:25:37.634426+00	2026-03-30 11:24:07.508318+00	kpgcigjpuvub	bbdcd7c2-0745-4225-bf47-6f29e7061bba
00000000-0000-0000-0000-000000000000	119	bqrtm453pfy6	8bc43a7a-c98b-42c5-91ee-1e421c2aaf92	t	2026-03-30 08:03:16.817881+00	2026-03-30 11:47:01.731753+00	cf4elpenvj3p	ffe71664-9463-49e4-b049-c0cc08447131
00000000-0000-0000-0000-000000000000	130	zr5ya5pmcocw	49f749b7-6973-463f-a122-22748aa7da8f	t	2026-03-30 09:21:49.194718+00	2026-03-30 11:54:32.753358+00	zbencpnmrnnk	b67b55db-428a-4863-ba01-3f62839ebd23
00000000-0000-0000-0000-000000000000	146	f6mkoldmzgnz	9e557ae3-2517-43c7-80df-2700ec910ec5	f	2026-03-30 11:57:12.46427+00	2026-03-30 11:57:12.46427+00	\N	a22f94b3-2082-469a-b443-d5012aff0811
00000000-0000-0000-0000-000000000000	140	6zcjied6d5my	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-03-30 11:24:07.528408+00	2026-03-30 12:22:08.658277+00	6ydwo4oi5j7u	bbdcd7c2-0745-4225-bf47-6f29e7061bba
00000000-0000-0000-0000-000000000000	142	tbvup3eioczo	5240aafe-ff7c-4038-9970-4563f64928ec	t	2026-03-30 11:30:37.981149+00	2026-03-30 12:52:53.619154+00	\N	2ae5bcdc-eb42-4779-bec0-7a761cb22638
00000000-0000-0000-0000-000000000000	147	v7divak3ozkk	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-03-30 12:22:08.688292+00	2026-03-30 13:20:38.607793+00	6zcjied6d5my	bbdcd7c2-0745-4225-bf47-6f29e7061bba
00000000-0000-0000-0000-000000000000	152	jdza6rwdcdgn	9e557ae3-2517-43c7-80df-2700ec910ec5	f	2026-03-30 13:22:03.842191+00	2026-03-30 13:22:03.842191+00	\N	dca166f5-97db-458b-b73f-b94fd6de2bfd
00000000-0000-0000-0000-000000000000	136	xwjxtzkb25z6	afc33010-fcb8-4cf4-a75b-23bbb096f014	t	2026-03-30 10:36:29.15015+00	2026-03-30 13:24:57.606507+00	6zq3e5k2zijz	edb0eaa0-2395-47e7-94e9-b7285e70518e
00000000-0000-0000-0000-000000000000	139	rzqxrhonut3l	4e949fa0-c160-4a4c-8e5b-dcb87426fddb	t	2026-03-30 11:00:27.092067+00	2026-03-30 13:25:54.646538+00	2i3bcgbqgms4	10dca00a-5227-40f5-ab4c-6271cb2280d2
00000000-0000-0000-0000-000000000000	120	zpeknkbigglv	59528fbf-7da5-4b93-ac63-578c212f9849	t	2026-03-30 08:16:35.790242+00	2026-03-30 13:48:20.10104+00	bhlagthr4pge	d159e928-1537-4a58-a0c9-af94bc94fd18
00000000-0000-0000-0000-000000000000	155	qny27ttwdja4	12089ea2-7925-4209-ba3a-d6b0976079b9	t	2026-03-30 13:30:13.139506+00	2026-03-30 14:28:23.99558+00	\N	6c5c7b52-a4c3-4c37-b891-427b9dfdac4e
00000000-0000-0000-0000-000000000000	141	hoxncvkr27tz	237593b0-b857-4f0e-81fc-448f838e3ba6	t	2026-03-30 11:26:31.619363+00	2026-03-30 16:47:02.656558+00	\N	6c309999-5de6-4971-a9e5-6d60f9164d78
00000000-0000-0000-0000-000000000000	160	7aozteb6ulwk	237593b0-b857-4f0e-81fc-448f838e3ba6	f	2026-03-30 16:47:02.67008+00	2026-03-30 16:47:02.67008+00	hoxncvkr27tz	6c309999-5de6-4971-a9e5-6d60f9164d78
00000000-0000-0000-0000-000000000000	153	2mxyzrc67avt	afc33010-fcb8-4cf4-a75b-23bbb096f014	t	2026-03-30 13:24:57.623754+00	2026-03-30 23:47:19.755234+00	xwjxtzkb25z6	edb0eaa0-2395-47e7-94e9-b7285e70518e
00000000-0000-0000-0000-000000000000	143	kktk2o7abrpw	8bc43a7a-c98b-42c5-91ee-1e421c2aaf92	t	2026-03-30 11:47:01.752818+00	2026-03-31 00:59:46.406438+00	bqrtm453pfy6	ffe71664-9463-49e4-b049-c0cc08447131
00000000-0000-0000-0000-000000000000	123	dk3waxchb57o	03ab5ebc-36bf-4cf6-948c-4f86ffdbbde3	t	2026-03-30 08:28:01.940459+00	2026-03-31 02:33:52.124125+00	bkslccspcwoj	33cab24d-b467-4e37-9385-dbbd97a005d1
00000000-0000-0000-0000-000000000000	157	5nlt4lokqzdq	ca5b9250-5867-4adf-a23b-120eec075fd0	t	2026-03-30 13:48:22.806714+00	2026-03-31 07:00:16.972884+00	\N	94343b5d-10bb-4cfc-85fe-d8438628c64a
00000000-0000-0000-0000-000000000000	156	eenwlddjtfzp	59528fbf-7da5-4b93-ac63-578c212f9849	t	2026-03-30 13:48:20.121874+00	2026-03-31 07:26:43.588048+00	zpeknkbigglv	d159e928-1537-4a58-a0c9-af94bc94fd18
00000000-0000-0000-0000-000000000000	128	c2exku4jwnp4	17640674-04f2-4b1c-b065-4b56a68e595b	t	2026-03-30 08:41:51.432054+00	2026-03-31 08:15:48.150989+00	f5yv4l6tz7fw	9d325d84-e10e-4f68-9099-f7293245ff0a
00000000-0000-0000-0000-000000000000	161	t6pjchz5ghrw	237593b0-b857-4f0e-81fc-448f838e3ba6	t	2026-03-30 17:21:21.774387+00	2026-03-31 09:27:01.138617+00	\N	0519d6d1-4310-4f32-9eef-c61ee575c78d
00000000-0000-0000-0000-000000000000	149	xopkombjzjly	e6cc8572-9783-42bc-94bd-bdc32ccfbac8	t	2026-03-30 13:14:41.73907+00	2026-03-31 10:24:30.878298+00	\N	04427342-13e3-4329-946d-96be129a7c6f
00000000-0000-0000-0000-000000000000	159	uvgp3dfsevuh	12089ea2-7925-4209-ba3a-d6b0976079b9	t	2026-03-30 14:28:24.014979+00	2026-03-31 11:52:08.478604+00	qny27ttwdja4	6c5c7b52-a4c3-4c37-b891-427b9dfdac4e
00000000-0000-0000-0000-000000000000	148	bmrtdc3pr2ar	5240aafe-ff7c-4038-9970-4563f64928ec	t	2026-03-30 12:52:53.638265+00	2026-03-31 14:15:43.030161+00	tbvup3eioczo	2ae5bcdc-eb42-4779-bec0-7a761cb22638
00000000-0000-0000-0000-000000000000	133	baqnipes76sa	f80c971a-5a82-4ced-83fb-1ee295a252b3	t	2026-03-30 09:49:49.261461+00	2026-03-31 15:22:38.956859+00	\N	6d08e063-542b-4a08-8850-0da538569127
00000000-0000-0000-0000-000000000000	138	e7ufohth3a6q	70f406c8-985c-4b16-af6d-68481e60bf32	t	2026-03-30 11:00:04.990487+00	2026-03-31 23:48:48.200191+00	hgykcbeq4aph	9ca2375a-2527-4278-a9e2-1886f3eccfc7
00000000-0000-0000-0000-000000000000	163	vyhcdnmz5wvx	9e557ae3-2517-43c7-80df-2700ec910ec5	f	2026-03-30 21:08:17.887062+00	2026-03-30 21:08:17.887062+00	\N	b2b6dc1a-244e-4a11-97de-e0d5659b0b68
00000000-0000-0000-0000-000000000000	164	cggyedr25yyp	17640674-04f2-4b1c-b065-4b56a68e595b	f	2026-03-30 21:09:24.710949+00	2026-03-30 21:09:24.710949+00	\N	dd5f252b-92b7-4857-8e5f-78de53186db6
00000000-0000-0000-0000-000000000000	145	k4bzqna2bwxw	49f749b7-6973-463f-a122-22748aa7da8f	t	2026-03-30 11:54:32.778199+00	2026-04-01 06:52:11.578492+00	zr5ya5pmcocw	b67b55db-428a-4863-ba01-3f62839ebd23
00000000-0000-0000-0000-000000000000	167	a7sues7firav	9e557ae3-2517-43c7-80df-2700ec910ec5	f	2026-03-31 00:03:09.912014+00	2026-03-31 00:03:09.912014+00	\N	2459e23f-3056-4e07-bf81-564def41e57d
00000000-0000-0000-0000-000000000000	191	bap2tznkt726	9e557ae3-2517-43c7-80df-2700ec910ec5	t	2026-03-31 09:11:05.649755+00	2026-04-01 11:45:39.004129+00	\N	2d771456-de74-485f-ace9-c87a686df8b8
00000000-0000-0000-0000-000000000000	211	wjnvh3emtz67	59528fbf-7da5-4b93-ac63-578c212f9849	t	2026-03-31 14:01:46.732518+00	2026-04-01 19:33:27.757346+00	iakt4hssycfm	d159e928-1537-4a58-a0c9-af94bc94fd18
00000000-0000-0000-0000-000000000000	165	7otsrvowyu7z	afc33010-fcb8-4cf4-a75b-23bbb096f014	t	2026-03-30 23:47:19.775776+00	2026-03-31 01:29:52.957474+00	2mxyzrc67avt	edb0eaa0-2395-47e7-94e9-b7285e70518e
00000000-0000-0000-0000-000000000000	201	myjcty7vnjrk	ca5b9250-5867-4adf-a23b-120eec075fd0	t	2026-03-31 10:50:28.119272+00	2026-04-02 04:25:48.886652+00	bjbhss625do6	94343b5d-10bb-4cfc-85fe-d8438628c64a
00000000-0000-0000-0000-000000000000	171	s4gdls5dk6ax	afc33010-fcb8-4cf4-a75b-23bbb096f014	t	2026-03-31 01:29:52.97739+00	2026-03-31 02:30:23.186309+00	7otsrvowyu7z	edb0eaa0-2395-47e7-94e9-b7285e70518e
00000000-0000-0000-0000-000000000000	173	k3b6slllpptq	afc33010-fcb8-4cf4-a75b-23bbb096f014	f	2026-03-31 02:30:23.204209+00	2026-03-31 02:30:23.204209+00	s4gdls5dk6ax	edb0eaa0-2395-47e7-94e9-b7285e70518e
00000000-0000-0000-0000-000000000000	174	xz5q6oz67ud6	03ab5ebc-36bf-4cf6-948c-4f86ffdbbde3	f	2026-03-31 02:33:52.144827+00	2026-03-31 02:33:52.144827+00	dk3waxchb57o	33cab24d-b467-4e37-9385-dbbd97a005d1
00000000-0000-0000-0000-000000000000	177	p4ju4xtakir3	9e557ae3-2517-43c7-80df-2700ec910ec5	f	2026-03-31 03:08:35.87995+00	2026-03-31 03:08:35.87995+00	\N	888356c7-c576-463e-b487-27ae3e3824e7
00000000-0000-0000-0000-000000000000	179	hvezrq4mz3ci	9e557ae3-2517-43c7-80df-2700ec910ec5	f	2026-03-31 03:59:23.796486+00	2026-03-31 03:59:23.796486+00	\N	a2c9765e-c8d3-4cb3-b77f-e84115258479
00000000-0000-0000-0000-000000000000	168	myp5usu4jvy5	8bc43a7a-c98b-42c5-91ee-1e421c2aaf92	t	2026-03-31 00:59:46.422336+00	2026-03-31 04:17:03.03753+00	kktk2o7abrpw	ffe71664-9463-49e4-b049-c0cc08447131
00000000-0000-0000-0000-000000000000	169	xk6qn6px4bpy	b6d69be7-f77a-4873-bd82-425ca563d6f1	t	2026-03-31 01:08:25.870592+00	2026-03-31 06:08:34.320156+00	4rlricqdh5aw	5c13d680-de01-48f2-b5f3-40f0cf08a8c0
00000000-0000-0000-0000-000000000000	181	z5nx3avd6ejh	b6d69be7-f77a-4873-bd82-425ca563d6f1	f	2026-03-31 06:08:34.334289+00	2026-03-31 06:08:34.334289+00	xk6qn6px4bpy	5c13d680-de01-48f2-b5f3-40f0cf08a8c0
00000000-0000-0000-0000-000000000000	184	wn7ezojsmcuk	b6d69be7-f77a-4873-bd82-425ca563d6f1	t	2026-03-31 06:59:47.930319+00	2026-03-31 08:09:25.421798+00	2k3rgw63wy6o	24091b0a-3979-4f69-9039-6d8b1ae844a0
00000000-0000-0000-0000-000000000000	187	uzgf3no5zeoy	b6d69be7-f77a-4873-bd82-425ca563d6f1	f	2026-03-31 08:09:25.43753+00	2026-03-31 08:09:25.43753+00	wn7ezojsmcuk	24091b0a-3979-4f69-9039-6d8b1ae844a0
00000000-0000-0000-0000-000000000000	188	ldwowqejctw7	17640674-04f2-4b1c-b065-4b56a68e595b	f	2026-03-31 08:15:48.159778+00	2026-03-31 08:15:48.159778+00	c2exku4jwnp4	9d325d84-e10e-4f68-9099-f7293245ff0a
00000000-0000-0000-0000-000000000000	190	ptbl7nwojhi5	9e557ae3-2517-43c7-80df-2700ec910ec5	f	2026-03-31 09:10:53.633658+00	2026-03-31 09:10:53.633658+00	b5dv4hbausmb	7bf94147-dbf7-458b-bd18-3164266434c6
00000000-0000-0000-0000-000000000000	192	ogte2bc7qaye	237593b0-b857-4f0e-81fc-448f838e3ba6	f	2026-03-31 09:27:01.154273+00	2026-03-31 09:27:01.154273+00	t6pjchz5ghrw	0519d6d1-4310-4f32-9eef-c61ee575c78d
00000000-0000-0000-0000-000000000000	189	i7haaagqmst7	17640674-04f2-4b1c-b065-4b56a68e595b	t	2026-03-31 08:41:38.92778+00	2026-03-31 09:40:10.868422+00	\N	9094b3e8-9ae6-4fad-ac7f-06d954fac04f
00000000-0000-0000-0000-000000000000	196	xojhddw4px3x	9e557ae3-2517-43c7-80df-2700ec910ec5	f	2026-03-31 10:16:05.266599+00	2026-03-31 10:16:05.266599+00	\N	0a95378e-b2ef-4616-8c4e-7c7a51abc678
00000000-0000-0000-0000-000000000000	197	hlux5excmzxq	e6cc8572-9783-42bc-94bd-bdc32ccfbac8	f	2026-03-31 10:24:30.918661+00	2026-03-31 10:24:30.918661+00	xopkombjzjly	04427342-13e3-4329-946d-96be129a7c6f
00000000-0000-0000-0000-000000000000	198	wwcxyhkcr5rs	e6cc8572-9783-42bc-94bd-bdc32ccfbac8	f	2026-03-31 10:24:44.243055+00	2026-03-31 10:24:44.243055+00	\N	8a9bff1b-89db-4fcd-9d13-1b63de2a6694
00000000-0000-0000-0000-000000000000	194	sjadm2n2c7j6	17640674-04f2-4b1c-b065-4b56a68e595b	t	2026-03-31 09:40:10.888738+00	2026-03-31 10:45:09.167736+00	i7haaagqmst7	9094b3e8-9ae6-4fad-ac7f-06d954fac04f
00000000-0000-0000-0000-000000000000	186	x3ehddqfb42f	59528fbf-7da5-4b93-ac63-578c212f9849	t	2026-03-31 07:26:43.606461+00	2026-03-31 10:48:18.251572+00	eenwlddjtfzp	d159e928-1537-4a58-a0c9-af94bc94fd18
00000000-0000-0000-0000-000000000000	185	bjbhss625do6	ca5b9250-5867-4adf-a23b-120eec075fd0	t	2026-03-31 07:00:16.997263+00	2026-03-31 10:50:28.109127+00	5nlt4lokqzdq	94343b5d-10bb-4cfc-85fe-d8438628c64a
00000000-0000-0000-0000-000000000000	193	pfsmyb5uq7aq	237593b0-b857-4f0e-81fc-448f838e3ba6	t	2026-03-31 09:27:03.310999+00	2026-03-31 10:56:09.350547+00	\N	560d1784-f626-4e39-84f2-641d2cbc2fd9
00000000-0000-0000-0000-000000000000	150	qka4q7uedyii	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-03-30 13:20:38.642534+00	2026-03-31 11:24:52.906352+00	v7divak3ozkk	bbdcd7c2-0745-4225-bf47-6f29e7061bba
00000000-0000-0000-0000-000000000000	200	gvgzmfrcs3ry	59528fbf-7da5-4b93-ac63-578c212f9849	t	2026-03-31 10:48:18.261784+00	2026-03-31 11:54:32.89824+00	x3ehddqfb42f	d159e928-1537-4a58-a0c9-af94bc94fd18
00000000-0000-0000-0000-000000000000	203	psgzz4bzu6ii	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-03-31 11:24:52.930649+00	2026-03-31 12:23:22.007912+00	qka4q7uedyii	bbdcd7c2-0745-4225-bf47-6f29e7061bba
00000000-0000-0000-0000-000000000000	204	wuhmvaznzho3	12089ea2-7925-4209-ba3a-d6b0976079b9	t	2026-03-31 11:52:08.497285+00	2026-03-31 12:50:37.355434+00	uvgp3dfsevuh	6c5c7b52-a4c3-4c37-b891-427b9dfdac4e
00000000-0000-0000-0000-000000000000	205	a524jtpdv2dd	59528fbf-7da5-4b93-ac63-578c212f9849	t	2026-03-31 11:54:32.935517+00	2026-03-31 13:02:49.739045+00	gvgzmfrcs3ry	d159e928-1537-4a58-a0c9-af94bc94fd18
00000000-0000-0000-0000-000000000000	206	ftnvwejod5c5	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-03-31 12:23:22.027154+00	2026-03-31 13:21:52.064535+00	psgzz4bzu6ii	bbdcd7c2-0745-4225-bf47-6f29e7061bba
00000000-0000-0000-0000-000000000000	207	k5iogpmoepbh	12089ea2-7925-4209-ba3a-d6b0976079b9	t	2026-03-31 12:50:37.374822+00	2026-03-31 13:48:54.771671+00	wuhmvaznzho3	6c5c7b52-a4c3-4c37-b891-427b9dfdac4e
00000000-0000-0000-0000-000000000000	210	czrjnlj4qbsz	12089ea2-7925-4209-ba3a-d6b0976079b9	f	2026-03-31 13:48:54.789368+00	2026-03-31 13:48:54.789368+00	k5iogpmoepbh	6c5c7b52-a4c3-4c37-b891-427b9dfdac4e
00000000-0000-0000-0000-000000000000	208	iakt4hssycfm	59528fbf-7da5-4b93-ac63-578c212f9849	t	2026-03-31 13:02:49.755479+00	2026-03-31 14:01:46.723956+00	a524jtpdv2dd	d159e928-1537-4a58-a0c9-af94bc94fd18
00000000-0000-0000-0000-000000000000	212	h2zkrejmm2eo	5240aafe-ff7c-4038-9970-4563f64928ec	f	2026-03-31 14:15:43.044335+00	2026-03-31 14:15:43.044335+00	bmrtdc3pr2ar	2ae5bcdc-eb42-4779-bec0-7a761cb22638
00000000-0000-0000-0000-000000000000	209	4ifnzbjutmmt	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-03-31 13:21:52.074825+00	2026-03-31 14:20:21.873317+00	ftnvwejod5c5	bbdcd7c2-0745-4225-bf47-6f29e7061bba
00000000-0000-0000-0000-000000000000	199	cddebprqkzav	17640674-04f2-4b1c-b065-4b56a68e595b	t	2026-03-31 10:45:09.188266+00	2026-03-31 15:09:39.659637+00	sjadm2n2c7j6	9094b3e8-9ae6-4fad-ac7f-06d954fac04f
00000000-0000-0000-0000-000000000000	202	qvwalwkdcawz	237593b0-b857-4f0e-81fc-448f838e3ba6	t	2026-03-31 10:56:09.36107+00	2026-03-31 16:02:11.505945+00	pfsmyb5uq7aq	560d1784-f626-4e39-84f2-641d2cbc2fd9
00000000-0000-0000-0000-000000000000	175	xl6zph2aecvh	03ab5ebc-36bf-4cf6-948c-4f86ffdbbde3	t	2026-03-31 02:33:56.054396+00	2026-03-31 16:18:12.254227+00	\N	de7bd133-72d1-4bbd-96a6-b22db1173cf9
00000000-0000-0000-0000-000000000000	172	2t3rm73wqjvx	7f569eac-1fb2-4c5a-9074-ca5fa50d3724	t	2026-03-31 01:57:43.763129+00	2026-04-01 01:41:07.793444+00	\N	35735c02-c556-4759-9359-adc4f4baa246
00000000-0000-0000-0000-000000000000	183	q6vo2555ngwx	9e557ae3-2517-43c7-80df-2700ec910ec5	t	2026-03-31 06:09:59.294877+00	2026-04-01 05:41:33.107163+00	\N	9e7bc1d2-e1bb-4504-b910-6af8792e665e
00000000-0000-0000-0000-000000000000	250	se3sewajxsc7	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-04-01 05:55:18.41752+00	2026-04-01 06:53:47.4283+00	xfzwmjh3rw6y	bbdcd7c2-0745-4225-bf47-6f29e7061bba
00000000-0000-0000-0000-000000000000	215	f2tljtuvgjf4	17640674-04f2-4b1c-b065-4b56a68e595b	f	2026-03-31 15:09:39.68848+00	2026-03-31 15:09:39.68848+00	cddebprqkzav	9094b3e8-9ae6-4fad-ac7f-06d954fac04f
00000000-0000-0000-0000-000000000000	213	lkhsukjb45zr	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-03-31 14:20:21.882053+00	2026-03-31 15:18:22.937325+00	4ifnzbjutmmt	bbdcd7c2-0745-4225-bf47-6f29e7061bba
00000000-0000-0000-0000-000000000000	243	diejqf2jsuhy	12089ea2-7925-4209-ba3a-d6b0976079b9	t	2026-04-01 02:44:28.922575+00	2026-04-01 07:32:30.983003+00	\N	26c3fd86-74c3-4e93-b54e-2b4d628cdecc
00000000-0000-0000-0000-000000000000	218	3yw7uqisgs7t	f80c971a-5a82-4ced-83fb-1ee295a252b3	f	2026-03-31 15:22:38.972643+00	2026-03-31 15:22:38.972643+00	baqnipes76sa	6d08e063-542b-4a08-8850-0da538569127
00000000-0000-0000-0000-000000000000	219	huh4hgfqqrrg	f80c971a-5a82-4ced-83fb-1ee295a252b3	f	2026-03-31 15:22:41.711089+00	2026-03-31 15:22:41.711089+00	\N	50482747-7228-4cee-a1d1-fc397161d261
00000000-0000-0000-0000-000000000000	214	rovbaszi542n	5240aafe-ff7c-4038-9970-4563f64928ec	t	2026-03-31 14:32:41.359214+00	2026-03-31 15:40:24.152136+00	\N	b8b59a5a-d476-4be4-8d77-5a4a7af04cba
00000000-0000-0000-0000-000000000000	222	x47qdgamz45n	237593b0-b857-4f0e-81fc-448f838e3ba6	f	2026-03-31 16:02:11.521481+00	2026-03-31 16:02:11.521481+00	qvwalwkdcawz	560d1784-f626-4e39-84f2-641d2cbc2fd9
00000000-0000-0000-0000-000000000000	217	ypzoosaysnyr	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-03-31 15:18:22.95364+00	2026-03-31 16:16:52.915807+00	lkhsukjb45zr	bbdcd7c2-0745-4225-bf47-6f29e7061bba
00000000-0000-0000-0000-000000000000	225	iyvopofwq3qe	03ab5ebc-36bf-4cf6-948c-4f86ffdbbde3	f	2026-03-31 16:18:12.256579+00	2026-03-31 16:18:12.256579+00	xl6zph2aecvh	de7bd133-72d1-4bbd-96a6-b22db1173cf9
00000000-0000-0000-0000-000000000000	226	poz7ntnw25n7	03ab5ebc-36bf-4cf6-948c-4f86ffdbbde3	f	2026-03-31 16:19:18.891505+00	2026-03-31 16:19:18.891505+00	\N	b83621fb-4d3b-4c0a-a922-42834e1a55c4
00000000-0000-0000-0000-000000000000	224	xqxuancaqz2w	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-03-31 16:16:52.929342+00	2026-03-31 17:15:22.161383+00	ypzoosaysnyr	bbdcd7c2-0745-4225-bf47-6f29e7061bba
00000000-0000-0000-0000-000000000000	254	5qmj45slwmzk	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-04-01 06:53:47.448208+00	2026-04-01 07:52:17.575365+00	se3sewajxsc7	bbdcd7c2-0745-4225-bf47-6f29e7061bba
00000000-0000-0000-0000-000000000000	229	4w746uokxmeg	9e557ae3-2517-43c7-80df-2700ec910ec5	f	2026-03-31 17:41:13.879959+00	2026-03-31 17:41:13.879959+00	\N	7db5e96c-452a-4c5f-b355-4ae23b0b7caf
00000000-0000-0000-0000-000000000000	227	5peabv52uyjx	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-03-31 17:15:22.181014+00	2026-03-31 18:13:52.902209+00	xqxuancaqz2w	bbdcd7c2-0745-4225-bf47-6f29e7061bba
00000000-0000-0000-0000-000000000000	230	g5ltqmqhqmgr	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-03-31 18:13:52.920697+00	2026-03-31 19:12:22.894241+00	5peabv52uyjx	bbdcd7c2-0745-4225-bf47-6f29e7061bba
00000000-0000-0000-0000-000000000000	180	q5hfegntmnli	8bc43a7a-c98b-42c5-91ee-1e421c2aaf92	t	2026-03-31 04:17:03.057455+00	2026-04-01 08:16:21.099611+00	myp5usu4jvy5	ffe71664-9463-49e4-b049-c0cc08447131
00000000-0000-0000-0000-000000000000	231	ccygytv36llr	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-03-31 19:12:22.911333+00	2026-03-31 20:10:52.886928+00	g5ltqmqhqmgr	bbdcd7c2-0745-4225-bf47-6f29e7061bba
00000000-0000-0000-0000-000000000000	232	ab6gmjnzkelb	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-03-31 20:10:52.915028+00	2026-03-31 21:09:22.047956+00	ccygytv36llr	bbdcd7c2-0745-4225-bf47-6f29e7061bba
00000000-0000-0000-0000-000000000000	256	wgsssit7dgcy	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-04-01 07:52:17.598648+00	2026-04-01 08:50:47.609083+00	5qmj45slwmzk	bbdcd7c2-0745-4225-bf47-6f29e7061bba
00000000-0000-0000-0000-000000000000	233	g3k5n7opazgs	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-03-31 21:09:22.065535+00	2026-03-31 22:07:52.696863+00	ab6gmjnzkelb	bbdcd7c2-0745-4225-bf47-6f29e7061bba
00000000-0000-0000-0000-000000000000	258	qyoxalxmzm3v	03c2a3c3-197e-45a0-a67d-95fc4288d21b	f	2026-04-01 08:50:47.62889+00	2026-04-01 08:50:47.62889+00	wgsssit7dgcy	bbdcd7c2-0745-4225-bf47-6f29e7061bba
00000000-0000-0000-0000-000000000000	234	gprkzwvseu6u	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-03-31 22:07:52.711316+00	2026-03-31 23:06:21.864066+00	g3k5n7opazgs	bbdcd7c2-0745-4225-bf47-6f29e7061bba
00000000-0000-0000-0000-000000000000	235	hvrp6ofma3u3	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-03-31 23:06:21.877757+00	2026-04-01 00:04:25.636838+00	gprkzwvseu6u	bbdcd7c2-0745-4225-bf47-6f29e7061bba
00000000-0000-0000-0000-000000000000	237	44ep4lmx2gv4	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-04-01 00:04:25.657223+00	2026-04-01 01:02:48.326976+00	hvrp6ofma3u3	bbdcd7c2-0745-4225-bf47-6f29e7061bba
00000000-0000-0000-0000-000000000000	75	zo6qkuxyvxjb	dcdd1ff2-fc86-4a07-9d88-74e8c21c8be2	t	2026-03-30 01:49:16.340296+00	2026-04-01 10:00:43.774393+00	\N	6079aa96-f939-4afa-870d-fccdfc3649e9
00000000-0000-0000-0000-000000000000	239	666rsxnrwfkp	7f569eac-1fb2-4c5a-9074-ca5fa50d3724	f	2026-04-01 01:41:07.80443+00	2026-04-01 01:41:07.80443+00	2t3rm73wqjvx	35735c02-c556-4759-9359-adc4f4baa246
00000000-0000-0000-0000-000000000000	223	e6rjb65zwbtp	237593b0-b857-4f0e-81fc-448f838e3ba6	t	2026-03-31 16:02:13.624435+00	2026-04-01 10:23:00.396826+00	\N	ca849098-7c49-4f03-83fe-b2d425ba1705
00000000-0000-0000-0000-000000000000	238	b46o6progsqa	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-04-01 01:02:48.340512+00	2026-04-01 02:01:17.525917+00	44ep4lmx2gv4	bbdcd7c2-0745-4225-bf47-6f29e7061bba
00000000-0000-0000-0000-000000000000	255	ceyntgrky2is	12089ea2-7925-4209-ba3a-d6b0976079b9	t	2026-04-01 07:32:31.004027+00	2026-04-01 10:50:59.159752+00	diejqf2jsuhy	26c3fd86-74c3-4e93-b54e-2b4d628cdecc
00000000-0000-0000-0000-000000000000	216	5jgkhcmzskqh	17640674-04f2-4b1c-b065-4b56a68e595b	t	2026-03-31 15:09:41.777405+00	2026-04-01 02:27:09.771725+00	\N	6bf4110a-0419-4105-a0f2-5d01cab3bdfd
00000000-0000-0000-0000-000000000000	241	kscbqnmxi27e	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-04-01 02:01:17.5818+00	2026-04-01 02:59:47.54156+00	b46o6progsqa	bbdcd7c2-0745-4225-bf47-6f29e7061bba
00000000-0000-0000-0000-000000000000	259	zxvjzsfaa3p6	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-04-01 08:59:15.481002+00	2026-04-01 11:39:34.979099+00	\N	a41fff56-89c7-4826-aa8d-638f24c2d8e2
00000000-0000-0000-0000-000000000000	240	vmgtbucdndv3	7f569eac-1fb2-4c5a-9074-ca5fa50d3724	t	2026-04-01 01:41:16.18776+00	2026-04-01 03:24:05.69563+00	\N	f275af0e-0209-418f-8c81-d7ef81886d85
00000000-0000-0000-0000-000000000000	245	itz6hwsl7nw2	7f569eac-1fb2-4c5a-9074-ca5fa50d3724	f	2026-04-01 03:24:05.715946+00	2026-04-01 03:24:05.715946+00	vmgtbucdndv3	f275af0e-0209-418f-8c81-d7ef81886d85
00000000-0000-0000-0000-000000000000	244	ohgsqiinycrm	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-04-01 02:59:47.567844+00	2026-04-01 03:58:17.571287+00	kscbqnmxi27e	bbdcd7c2-0745-4225-bf47-6f29e7061bba
00000000-0000-0000-0000-000000000000	246	kqy5ynr2rb72	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-04-01 03:58:17.583821+00	2026-04-01 04:56:48.284577+00	ohgsqiinycrm	bbdcd7c2-0745-4225-bf47-6f29e7061bba
00000000-0000-0000-0000-000000000000	221	6pm2347r663j	5240aafe-ff7c-4038-9970-4563f64928ec	t	2026-03-31 15:40:24.168449+00	2026-04-01 12:53:12.672099+00	rovbaszi542n	b8b59a5a-d476-4be4-8d77-5a4a7af04cba
00000000-0000-0000-0000-000000000000	248	4ppy4t273m5i	9e557ae3-2517-43c7-80df-2700ec910ec5	f	2026-04-01 05:41:33.124172+00	2026-04-01 05:41:33.124172+00	q6vo2555ngwx	9e7bc1d2-e1bb-4504-b910-6af8792e665e
00000000-0000-0000-0000-000000000000	249	bqrhwypfoof7	9e557ae3-2517-43c7-80df-2700ec910ec5	f	2026-04-01 05:41:37.769524+00	2026-04-01 05:41:37.769524+00	\N	470f633b-2aca-4415-b803-05f6589ea2b2
00000000-0000-0000-0000-000000000000	247	xfzwmjh3rw6y	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-04-01 04:56:48.30859+00	2026-04-01 05:55:18.395063+00	kqy5ynr2rb72	bbdcd7c2-0745-4225-bf47-6f29e7061bba
00000000-0000-0000-0000-000000000000	220	64xem6gk776f	f80c971a-5a82-4ced-83fb-1ee295a252b3	t	2026-03-31 15:27:20.782921+00	2026-04-01 13:40:10.849117+00	\N	ff915bc1-4795-463a-b50e-33749da3a0b1
00000000-0000-0000-0000-000000000000	242	ql7x3npidxd2	17640674-04f2-4b1c-b065-4b56a68e595b	t	2026-04-01 02:27:09.78659+00	2026-04-01 14:09:14.423064+00	5jgkhcmzskqh	6bf4110a-0419-4105-a0f2-5d01cab3bdfd
00000000-0000-0000-0000-000000000000	257	mayfaymtm2ov	8bc43a7a-c98b-42c5-91ee-1e421c2aaf92	t	2026-04-01 08:16:21.114375+00	2026-04-01 14:37:17.311012+00	q5hfegntmnli	ffe71664-9463-49e4-b049-c0cc08447131
00000000-0000-0000-0000-000000000000	253	btwfgl2k4fbr	49f749b7-6973-463f-a122-22748aa7da8f	t	2026-04-01 06:52:11.599263+00	2026-04-02 02:34:22.729724+00	k4bzqna2bwxw	b67b55db-428a-4863-ba01-3f62839ebd23
00000000-0000-0000-0000-000000000000	236	xfzlyznzq5ll	70f406c8-985c-4b16-af6d-68481e60bf32	t	2026-03-31 23:48:48.216652+00	2026-04-02 07:55:27.774941+00	e7ufohth3a6q	9ca2375a-2527-4278-a9e2-1886f3eccfc7
00000000-0000-0000-0000-000000000000	262	vtzoyuhhvcac	237593b0-b857-4f0e-81fc-448f838e3ba6	f	2026-04-01 10:23:00.415732+00	2026-04-01 10:23:00.415732+00	e6rjb65zwbtp	ca849098-7c49-4f03-83fe-b2d425ba1705
00000000-0000-0000-0000-000000000000	265	zosd4tekxs7h	b6d69be7-f77a-4873-bd82-425ca563d6f1	f	2026-04-01 10:33:48.645307+00	2026-04-01 10:33:48.645307+00	\N	25082c96-9ef5-43d1-88e4-4d35b57bd97d
00000000-0000-0000-0000-000000000000	266	slq6jjkdcquy	b6d69be7-f77a-4873-bd82-425ca563d6f1	f	2026-04-01 10:35:24.907594+00	2026-04-01 10:35:24.907594+00	\N	25c78c30-4eb5-4b9c-b543-65b26c8b4758
00000000-0000-0000-0000-000000000000	267	ff4kruoytwft	b6d69be7-f77a-4873-bd82-425ca563d6f1	f	2026-04-01 10:38:49.115185+00	2026-04-01 10:38:49.115185+00	\N	6e097e48-836d-4849-a90f-a1ce2b3c80dd
00000000-0000-0000-0000-000000000000	263	ausq73mudxsb	237593b0-b857-4f0e-81fc-448f838e3ba6	t	2026-04-01 10:23:08.286001+00	2026-04-01 11:22:24.604112+00	\N	123fc6e3-ef7d-40c0-befc-ae7105a184a9
00000000-0000-0000-0000-000000000000	270	eb3nyqsuijid	03c2a3c3-197e-45a0-a67d-95fc4288d21b	f	2026-04-01 11:39:34.995242+00	2026-04-01 11:39:34.995242+00	zxvjzsfaa3p6	a41fff56-89c7-4826-aa8d-638f24c2d8e2
00000000-0000-0000-0000-000000000000	272	qoagvxrp4sqm	9e557ae3-2517-43c7-80df-2700ec910ec5	f	2026-04-01 11:45:39.022616+00	2026-04-01 11:45:39.022616+00	bap2tznkt726	2d771456-de74-485f-ace9-c87a686df8b8
00000000-0000-0000-0000-000000000000	261	amzsjjrvfvse	dcdd1ff2-fc86-4a07-9d88-74e8c21c8be2	t	2026-04-01 10:00:43.821591+00	2026-04-01 11:53:08.923985+00	zo6qkuxyvxjb	6079aa96-f939-4afa-870d-fccdfc3649e9
00000000-0000-0000-0000-000000000000	274	xokumzizsu62	dcdd1ff2-fc86-4a07-9d88-74e8c21c8be2	f	2026-04-01 11:53:08.946666+00	2026-04-01 11:53:08.946666+00	amzsjjrvfvse	6079aa96-f939-4afa-870d-fccdfc3649e9
00000000-0000-0000-0000-000000000000	273	z7oj2smbv2yt	9e557ae3-2517-43c7-80df-2700ec910ec5	t	2026-04-01 11:45:49.169481+00	2026-04-01 13:14:11.841369+00	\N	da366692-adc1-4ac4-abd9-4c2779d6cfa4
00000000-0000-0000-0000-000000000000	269	thc2crua2tky	237593b0-b857-4f0e-81fc-448f838e3ba6	t	2026-04-01 11:22:24.617644+00	2026-04-01 13:16:31.661442+00	ausq73mudxsb	123fc6e3-ef7d-40c0-befc-ae7105a184a9
00000000-0000-0000-0000-000000000000	282	hxjjtft6usic	f80c971a-5a82-4ced-83fb-1ee295a252b3	f	2026-04-01 13:40:10.868658+00	2026-04-01 13:40:10.868658+00	64xem6gk776f	ff915bc1-4795-463a-b50e-33749da3a0b1
00000000-0000-0000-0000-000000000000	279	m3zgjxixdjfh	5240aafe-ff7c-4038-9970-4563f64928ec	t	2026-04-01 12:53:12.692625+00	2026-04-01 13:58:35.215303+00	6pm2347r663j	b8b59a5a-d476-4be4-8d77-5a4a7af04cba
00000000-0000-0000-0000-000000000000	285	uhtq2qrfhqoh	5240aafe-ff7c-4038-9970-4563f64928ec	f	2026-04-01 13:58:35.238681+00	2026-04-01 13:58:35.238681+00	m3zgjxixdjfh	b8b59a5a-d476-4be4-8d77-5a4a7af04cba
00000000-0000-0000-0000-000000000000	286	mthczmwfxodh	4e949fa0-c160-4a4c-8e5b-dcb87426fddb	f	2026-04-01 14:01:25.519283+00	2026-04-01 14:01:25.519283+00	mfbz3ivh3i6e	10dca00a-5227-40f5-ab4c-6271cb2280d2
00000000-0000-0000-0000-000000000000	287	7ubxvkxzf2tx	17640674-04f2-4b1c-b065-4b56a68e595b	f	2026-04-01 14:09:14.439921+00	2026-04-01 14:09:14.439921+00	ql7x3npidxd2	6bf4110a-0419-4105-a0f2-5d01cab3bdfd
00000000-0000-0000-0000-000000000000	290	7nuqsfbvkosi	5240aafe-ff7c-4038-9970-4563f64928ec	f	2026-04-01 14:13:20.863348+00	2026-04-01 14:13:20.863348+00	\N	c8c67fd7-5fcd-4859-8d6b-ddc7b18bb179
00000000-0000-0000-0000-000000000000	291	4guzk5mw4fvs	f80c971a-5a82-4ced-83fb-1ee295a252b3	f	2026-04-01 14:13:30.333934+00	2026-04-01 14:13:30.333934+00	\N	5190e1f8-699a-470c-bc1f-cd512952492f
00000000-0000-0000-0000-000000000000	283	6gbhoyfq3gol	b6d69be7-f77a-4873-bd82-425ca563d6f1	t	2026-04-01 13:42:40.934948+00	2026-04-01 14:41:41.417657+00	\N	1be46f6e-dca0-4c02-8547-8bdcb599c3e1
00000000-0000-0000-0000-000000000000	281	stzqgbi3zni7	237593b0-b857-4f0e-81fc-448f838e3ba6	t	2026-04-01 13:16:31.669743+00	2026-04-01 14:54:48.107805+00	thc2crua2tky	123fc6e3-ef7d-40c0-befc-ae7105a184a9
00000000-0000-0000-0000-000000000000	280	fwabj4qaoxe4	9e557ae3-2517-43c7-80df-2700ec910ec5	t	2026-04-01 13:14:11.86554+00	2026-04-01 15:15:31.52607+00	z7oj2smbv2yt	da366692-adc1-4ac4-abd9-4c2779d6cfa4
00000000-0000-0000-0000-000000000000	297	bkrzxwq4zppj	9e557ae3-2517-43c7-80df-2700ec910ec5	f	2026-04-01 15:15:31.549171+00	2026-04-01 15:15:31.549171+00	fwabj4qaoxe4	da366692-adc1-4ac4-abd9-4c2779d6cfa4
00000000-0000-0000-0000-000000000000	288	3w4gfczaugo4	17640674-04f2-4b1c-b065-4b56a68e595b	t	2026-04-01 14:09:16.800212+00	2026-04-01 15:27:02.544902+00	\N	add96c67-78be-4118-b771-fb8173fae889
00000000-0000-0000-0000-000000000000	295	ys3fo3k352oa	237593b0-b857-4f0e-81fc-448f838e3ba6	t	2026-04-01 14:54:48.129073+00	2026-04-01 15:56:13.928622+00	stzqgbi3zni7	123fc6e3-ef7d-40c0-befc-ae7105a184a9
00000000-0000-0000-0000-000000000000	301	3xxnoxtk5zlu	9e557ae3-2517-43c7-80df-2700ec910ec5	f	2026-04-01 16:00:00.720263+00	2026-04-01 16:00:00.720263+00	\N	14e2b0ae-ce08-419a-af73-7235f09b10f1
00000000-0000-0000-0000-000000000000	302	se3tnxhhpiaq	b6d69be7-f77a-4873-bd82-425ca563d6f1	f	2026-04-01 16:02:52.437361+00	2026-04-01 16:02:52.437361+00	\N	70300518-a296-49ba-b58f-e0095d3af967
00000000-0000-0000-0000-000000000000	268	kpbsbmubqid2	12089ea2-7925-4209-ba3a-d6b0976079b9	t	2026-04-01 10:50:59.2337+00	2026-04-01 16:18:52.743954+00	ceyntgrky2is	26c3fd86-74c3-4e93-b54e-2b4d628cdecc
00000000-0000-0000-0000-000000000000	304	3fgdtanfzjir	12089ea2-7925-4209-ba3a-d6b0976079b9	f	2026-04-01 16:18:52.769396+00	2026-04-01 16:18:52.769396+00	kpbsbmubqid2	26c3fd86-74c3-4e93-b54e-2b4d628cdecc
00000000-0000-0000-0000-000000000000	299	ghyyhu4gvntk	17640674-04f2-4b1c-b065-4b56a68e595b	t	2026-04-01 15:27:02.564184+00	2026-04-01 16:28:05.014058+00	3w4gfczaugo4	add96c67-78be-4118-b771-fb8173fae889
00000000-0000-0000-0000-000000000000	305	wufpxusia74a	17640674-04f2-4b1c-b065-4b56a68e595b	f	2026-04-01 16:28:05.033678+00	2026-04-01 16:28:05.033678+00	ghyyhu4gvntk	add96c67-78be-4118-b771-fb8173fae889
00000000-0000-0000-0000-000000000000	300	yu3xuv2ryxh6	237593b0-b857-4f0e-81fc-448f838e3ba6	t	2026-04-01 15:56:13.943092+00	2026-04-01 17:31:40.871143+00	ys3fo3k352oa	123fc6e3-ef7d-40c0-befc-ae7105a184a9
00000000-0000-0000-0000-000000000000	307	yrccewsoq5lc	59528fbf-7da5-4b93-ac63-578c212f9849	t	2026-04-01 19:33:27.782376+00	2026-04-01 21:07:36.808523+00	wjnvh3emtz67	d159e928-1537-4a58-a0c9-af94bc94fd18
00000000-0000-0000-0000-000000000000	308	tydh57ps5ck5	59528fbf-7da5-4b93-ac63-578c212f9849	f	2026-04-01 21:07:36.828892+00	2026-04-01 21:07:36.828892+00	yrccewsoq5lc	d159e928-1537-4a58-a0c9-af94bc94fd18
00000000-0000-0000-0000-000000000000	310	ukmot4ddty3e	b6d69be7-f77a-4873-bd82-425ca563d6f1	f	2026-04-02 00:18:52.767986+00	2026-04-02 00:18:52.767986+00	\N	9944ac62-7a21-47f9-947c-5c2cb5cf8ce9
00000000-0000-0000-0000-000000000000	311	g4bazj2i5p7n	17640674-04f2-4b1c-b065-4b56a68e595b	f	2026-04-02 01:01:14.535186+00	2026-04-02 01:01:14.535186+00	\N	387db9d7-cd6a-4f04-ac4f-20e32f4b9647
00000000-0000-0000-0000-000000000000	292	qyf2o32dn2zq	8bc43a7a-c98b-42c5-91ee-1e421c2aaf92	t	2026-04-01 14:37:17.328181+00	2026-04-02 01:58:21.624788+00	mayfaymtm2ov	ffe71664-9463-49e4-b049-c0cc08447131
00000000-0000-0000-0000-000000000000	313	iqo7u6ubeacb	49f749b7-6973-463f-a122-22748aa7da8f	t	2026-04-02 02:34:22.824261+00	2026-04-02 03:32:52.04275+00	btwfgl2k4fbr	b67b55db-428a-4863-ba01-3f62839ebd23
00000000-0000-0000-0000-000000000000	315	5bwsb6t3wmrb	b6d69be7-f77a-4873-bd82-425ca563d6f1	f	2026-04-02 03:47:20.510757+00	2026-04-02 03:47:20.510757+00	\N	b0e9c90a-f642-463d-bc02-0bc93dae432c
00000000-0000-0000-0000-000000000000	316	436j6r4lch4q	b6d69be7-f77a-4873-bd82-425ca563d6f1	f	2026-04-02 03:48:54.750959+00	2026-04-02 03:48:54.750959+00	\N	75c63164-b665-4493-bd22-0fd19691e92a
00000000-0000-0000-0000-000000000000	312	el624h3zt7ia	8bc43a7a-c98b-42c5-91ee-1e421c2aaf92	t	2026-04-02 01:58:21.645902+00	2026-04-02 03:51:20.178418+00	qyf2o32dn2zq	ffe71664-9463-49e4-b049-c0cc08447131
00000000-0000-0000-0000-000000000000	318	v3zzz3qewwpi	ca5b9250-5867-4adf-a23b-120eec075fd0	f	2026-04-02 04:25:48.90668+00	2026-04-02 04:25:48.90668+00	myjcty7vnjrk	94343b5d-10bb-4cfc-85fe-d8438628c64a
00000000-0000-0000-0000-000000000000	314	du3tpy3lmmmw	49f749b7-6973-463f-a122-22748aa7da8f	t	2026-04-02 03:32:52.061072+00	2026-04-02 04:31:21.936662+00	iqo7u6ubeacb	b67b55db-428a-4863-ba01-3f62839ebd23
00000000-0000-0000-0000-000000000000	317	ovdrnpoqxxpk	8bc43a7a-c98b-42c5-91ee-1e421c2aaf92	t	2026-04-02 03:51:20.204894+00	2026-04-02 05:18:04.226453+00	el624h3zt7ia	ffe71664-9463-49e4-b049-c0cc08447131
00000000-0000-0000-0000-000000000000	319	ch7fprt7jwp6	49f749b7-6973-463f-a122-22748aa7da8f	t	2026-04-02 04:31:21.948051+00	2026-04-02 05:29:22.055138+00	du3tpy3lmmmw	b67b55db-428a-4863-ba01-3f62839ebd23
00000000-0000-0000-0000-000000000000	320	cdjipsqqcpzz	8bc43a7a-c98b-42c5-91ee-1e421c2aaf92	t	2026-04-02 05:18:04.24482+00	2026-04-02 06:25:45.345248+00	ovdrnpoqxxpk	ffe71664-9463-49e4-b049-c0cc08447131
00000000-0000-0000-0000-000000000000	271	jtr4m4aqpkxk	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-04-01 11:39:54.061457+00	2026-04-02 07:02:54.975547+00	\N	015efcb3-472c-4ef6-94eb-355726d63a81
00000000-0000-0000-0000-000000000000	306	dzm5nare2zbx	237593b0-b857-4f0e-81fc-448f838e3ba6	t	2026-04-01 17:31:40.885046+00	2026-04-02 07:12:01.861008+00	yu3xuv2ryxh6	123fc6e3-ef7d-40c0-befc-ae7105a184a9
00000000-0000-0000-0000-000000000000	298	mcs6c27zcbed	9e557ae3-2517-43c7-80df-2700ec910ec5	t	2026-04-01 15:24:52.34897+00	2026-04-02 14:26:03.48309+00	\N	9780424b-c5c7-4360-a829-0089698a11d6
00000000-0000-0000-0000-000000000000	293	d73yskp5nyos	b6d69be7-f77a-4873-bd82-425ca563d6f1	t	2026-04-01 14:41:41.432218+00	2026-04-02 15:01:30.813038+00	6gbhoyfq3gol	1be46f6e-dca0-4c02-8547-8bdcb599c3e1
00000000-0000-0000-0000-000000000000	276	zmbb2yu3drny	96ae0d10-51f5-4fda-a5c0-1a778a9ab46e	t	2026-04-01 12:36:02.542402+00	2026-04-02 15:05:33.332078+00	\N	2668283d-50af-4120-971c-0714a8aa34c2
00000000-0000-0000-0000-000000000000	289	zmlq5imw3yo2	f80c971a-5a82-4ced-83fb-1ee295a252b3	t	2026-04-01 14:11:06.711601+00	2026-04-02 15:14:56.774056+00	\N	f3d563d2-fdcb-4947-9e57-93e589101945
00000000-0000-0000-0000-000000000000	321	vg3xcr6jpmz4	49f749b7-6973-463f-a122-22748aa7da8f	t	2026-04-02 05:29:22.073289+00	2026-04-02 06:27:52.49378+00	ch7fprt7jwp6	b67b55db-428a-4863-ba01-3f62839ebd23
00000000-0000-0000-0000-000000000000	323	p2vhxzfen5ml	49f749b7-6973-463f-a122-22748aa7da8f	f	2026-04-02 06:27:52.518391+00	2026-04-02 06:27:52.518391+00	vg3xcr6jpmz4	b67b55db-428a-4863-ba01-3f62839ebd23
00000000-0000-0000-0000-000000000000	324	inouofzmebkp	03c2a3c3-197e-45a0-a67d-95fc4288d21b	f	2026-04-02 07:02:55.001333+00	2026-04-02 07:02:55.001333+00	jtr4m4aqpkxk	015efcb3-472c-4ef6-94eb-355726d63a81
00000000-0000-0000-0000-000000000000	326	iyt4uekn6dgd	237593b0-b857-4f0e-81fc-448f838e3ba6	f	2026-04-02 07:12:01.882979+00	2026-04-02 07:12:01.882979+00	dzm5nare2zbx	123fc6e3-ef7d-40c0-befc-ae7105a184a9
00000000-0000-0000-0000-000000000000	328	xxy4ufa77te6	70f406c8-985c-4b16-af6d-68481e60bf32	f	2026-04-02 07:55:27.79453+00	2026-04-02 07:55:27.79453+00	xfzlyznzq5ll	9ca2375a-2527-4278-a9e2-1886f3eccfc7
00000000-0000-0000-0000-000000000000	325	dd7cwdh6xkvm	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-04-02 07:05:50.194945+00	2026-04-02 08:04:21.882807+00	\N	4adf3cb4-0821-427f-9b2e-773114c8de7e
00000000-0000-0000-0000-000000000000	330	64mvgxihrejp	2643c4ad-992b-4ad0-a325-df9ccc7f91f6	f	2026-04-02 08:18:23.731716+00	2026-04-02 08:18:23.731716+00	\N	7bc05121-7578-49a0-b428-1c30da66e2f1
00000000-0000-0000-0000-000000000000	331	vjqck7ahljzd	2643c4ad-992b-4ad0-a325-df9ccc7f91f6	f	2026-04-02 08:18:36.453929+00	2026-04-02 08:18:36.453929+00	\N	69fedcaa-6f85-4858-a305-682c7bbfa7ed
00000000-0000-0000-0000-000000000000	332	xhcitjlkj5ma	2643c4ad-992b-4ad0-a325-df9ccc7f91f6	f	2026-04-02 08:20:16.91435+00	2026-04-02 08:20:16.91435+00	\N	ffe7510c-f66b-4cd7-8576-0bd0557c87af
00000000-0000-0000-0000-000000000000	333	2h4pwqvggshi	2643c4ad-992b-4ad0-a325-df9ccc7f91f6	f	2026-04-02 08:20:34.547042+00	2026-04-02 08:20:34.547042+00	\N	959b45f2-7dcd-4132-aa87-7e4710aac541
00000000-0000-0000-0000-000000000000	327	u7cx4lesg3hh	237593b0-b857-4f0e-81fc-448f838e3ba6	t	2026-04-02 07:12:04.732229+00	2026-04-02 08:22:20.708024+00	\N	01b505db-1243-4d4c-a0de-9e7a32fe17ce
00000000-0000-0000-0000-000000000000	335	dd2h65d4am4p	8bc0bda5-b788-476e-9966-31206b9fb38d	f	2026-04-02 08:25:06.8159+00	2026-04-02 08:25:06.8159+00	\N	9748f8c0-9e1e-4b0f-bd86-abc1297f4808
00000000-0000-0000-0000-000000000000	329	y3ts3ffsutar	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-04-02 08:04:21.918852+00	2026-04-02 09:06:51.731232+00	dd7cwdh6xkvm	4adf3cb4-0821-427f-9b2e-773114c8de7e
00000000-0000-0000-0000-000000000000	336	cpem3ru7c23r	03c2a3c3-197e-45a0-a67d-95fc4288d21b	f	2026-04-02 09:06:53.934631+00	2026-04-02 09:06:53.934631+00	y3ts3ffsutar	4adf3cb4-0821-427f-9b2e-773114c8de7e
00000000-0000-0000-0000-000000000000	337	axlghxkixtrj	8bc0bda5-b788-476e-9966-31206b9fb38d	f	2026-04-02 09:07:01.462457+00	2026-04-02 09:07:01.462457+00	\N	d71b7602-fdc5-46d5-8327-2eeff5bca17a
00000000-0000-0000-0000-000000000000	322	j66fysytgir6	8bc43a7a-c98b-42c5-91ee-1e421c2aaf92	t	2026-04-02 06:25:45.393351+00	2026-04-02 09:16:35.196385+00	cdjipsqqcpzz	ffe71664-9463-49e4-b049-c0cc08447131
00000000-0000-0000-0000-000000000000	340	sbuuxeeu56ht	8bc0bda5-b788-476e-9966-31206b9fb38d	f	2026-04-02 09:17:04.39126+00	2026-04-02 09:17:04.39126+00	\N	fb564140-af79-4934-91a9-852c01635aa1
00000000-0000-0000-0000-000000000000	339	5h2c7ljkndow	8bc43a7a-c98b-42c5-91ee-1e421c2aaf92	t	2026-04-02 09:16:35.223841+00	2026-04-02 14:00:51.178301+00	j66fysytgir6	ffe71664-9463-49e4-b049-c0cc08447131
00000000-0000-0000-0000-000000000000	406	l7m2732cs5sp	8bc43a7a-c98b-42c5-91ee-1e421c2aaf92	f	2026-04-02 14:00:51.197419+00	2026-04-02 14:00:51.197419+00	5h2c7ljkndow	ffe71664-9463-49e4-b049-c0cc08447131
00000000-0000-0000-0000-000000000000	407	xyn2gpkb5kdx	9e557ae3-2517-43c7-80df-2700ec910ec5	f	2026-04-02 14:26:03.511578+00	2026-04-02 14:26:03.511578+00	mcs6c27zcbed	9780424b-c5c7-4360-a829-0089698a11d6
00000000-0000-0000-0000-000000000000	408	hecnfvhgmz45	9e557ae3-2517-43c7-80df-2700ec910ec5	f	2026-04-02 14:26:17.474657+00	2026-04-02 14:26:17.474657+00	\N	5daba084-9803-4227-8adf-5165c5433bbf
00000000-0000-0000-0000-000000000000	409	n67snzc7se4g	b6d69be7-f77a-4873-bd82-425ca563d6f1	f	2026-04-02 15:01:30.828269+00	2026-04-02 15:01:30.828269+00	d73yskp5nyos	1be46f6e-dca0-4c02-8547-8bdcb599c3e1
00000000-0000-0000-0000-000000000000	410	lyjllfrvcfju	b6d69be7-f77a-4873-bd82-425ca563d6f1	f	2026-04-02 15:01:55.656766+00	2026-04-02 15:01:55.656766+00	\N	f60120f9-3de5-4305-a2fa-a5c410f95b80
00000000-0000-0000-0000-000000000000	334	3dozuqkmyp2l	237593b0-b857-4f0e-81fc-448f838e3ba6	t	2026-04-02 08:22:20.721663+00	2026-04-02 15:04:28.82362+00	u7cx4lesg3hh	01b505db-1243-4d4c-a0de-9e7a32fe17ce
00000000-0000-0000-0000-000000000000	411	nwqrciqhbu3q	237593b0-b857-4f0e-81fc-448f838e3ba6	f	2026-04-02 15:04:28.838127+00	2026-04-02 15:04:28.838127+00	3dozuqkmyp2l	01b505db-1243-4d4c-a0de-9e7a32fe17ce
00000000-0000-0000-0000-000000000000	412	xi77biyormqe	237593b0-b857-4f0e-81fc-448f838e3ba6	f	2026-04-02 15:04:30.674788+00	2026-04-02 15:04:30.674788+00	\N	f248ccf2-7b6a-4725-b887-e908aadb4b84
00000000-0000-0000-0000-000000000000	338	jg2gbhsbcxd6	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-04-02 09:07:15.518952+00	2026-04-02 15:05:21.041261+00	\N	3bb2944b-7f3b-4f00-a4ba-20d125e3a3ab
00000000-0000-0000-0000-000000000000	413	3w7cz3qs7pjl	03c2a3c3-197e-45a0-a67d-95fc4288d21b	f	2026-04-02 15:05:21.050614+00	2026-04-02 15:05:21.050614+00	jg2gbhsbcxd6	3bb2944b-7f3b-4f00-a4ba-20d125e3a3ab
00000000-0000-0000-0000-000000000000	414	prrqjgbtvjra	96ae0d10-51f5-4fda-a5c0-1a778a9ab46e	f	2026-04-02 15:05:33.332502+00	2026-04-02 15:05:33.332502+00	zmbb2yu3drny	2668283d-50af-4120-971c-0714a8aa34c2
00000000-0000-0000-0000-000000000000	416	5wju4umi6xjl	f3c27e4e-db1a-478b-8f9f-f0e9fa742356	f	2026-04-02 15:06:41.363318+00	2026-04-02 15:06:41.363318+00	\N	5d2143ce-9104-4fc7-b69a-d81a90f032e7
00000000-0000-0000-0000-000000000000	417	ffk7qkh4wjy5	8bc0bda5-b788-476e-9966-31206b9fb38d	f	2026-04-02 15:08:13.447857+00	2026-04-02 15:08:13.447857+00	\N	b4276e1f-b06c-4e59-ba57-01aac8189d63
00000000-0000-0000-0000-000000000000	418	nqzhvvip726k	17640674-04f2-4b1c-b065-4b56a68e595b	f	2026-04-02 15:08:17.917691+00	2026-04-02 15:08:17.917691+00	\N	68b4cdd9-5b07-4e3f-a86c-bc5497fad4c9
00000000-0000-0000-0000-000000000000	419	fyouyrh2vi2h	f80c971a-5a82-4ced-83fb-1ee295a252b3	f	2026-04-02 15:14:56.79236+00	2026-04-02 15:14:56.79236+00	zmlq5imw3yo2	f3d563d2-fdcb-4947-9e57-93e589101945
00000000-0000-0000-0000-000000000000	420	hfls65hasqmd	f80c971a-5a82-4ced-83fb-1ee295a252b3	f	2026-04-02 15:15:08.548028+00	2026-04-02 15:15:08.548028+00	\N	c84e5c0e-541c-4bc2-87ec-1d7cb967c52d
00000000-0000-0000-0000-000000000000	421	q6owrdrsyqdb	f3c27e4e-db1a-478b-8f9f-f0e9fa742356	f	2026-04-02 15:30:08.276413+00	2026-04-02 15:30:08.276413+00	\N	ef646cb2-a212-4fa0-b0e4-f082031ee847
00000000-0000-0000-0000-000000000000	422	d2cz5szb4xoh	4e949fa0-c160-4a4c-8e5b-dcb87426fddb	f	2026-04-02 15:31:04.876888+00	2026-04-02 15:31:04.876888+00	ynwu2lnt5b3o	3af8f97b-d6cb-414e-9aff-e5ba3bc919aa
00000000-0000-0000-0000-000000000000	415	nj2v4i5ldl5r	03c2a3c3-197e-45a0-a67d-95fc4288d21b	t	2026-04-02 15:05:45.051984+00	2026-04-02 16:05:54.857618+00	\N	b6deff39-d859-437b-abb1-5e830960e552
00000000-0000-0000-0000-000000000000	372	gjeygl4njeid	2643c4ad-992b-4ad0-a325-df9ccc7f91f6	t	2026-04-02 12:15:51.793457+00	2026-04-02 16:05:55.771129+00	\N	324673f4-31f5-4ef0-8aa3-3b6211d2c49a
00000000-0000-0000-0000-000000000000	427	45k2erpnpooe	03c2a3c3-197e-45a0-a67d-95fc4288d21b	f	2026-04-02 16:05:58.198749+00	2026-04-02 16:05:58.198749+00	nj2v4i5ldl5r	b6deff39-d859-437b-abb1-5e830960e552
00000000-0000-0000-0000-000000000000	428	5wrzrbfgtbgx	2643c4ad-992b-4ad0-a325-df9ccc7f91f6	f	2026-04-02 16:05:58.198854+00	2026-04-02 16:05:58.198854+00	gjeygl4njeid	324673f4-31f5-4ef0-8aa3-3b6211d2c49a
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at, disabled) FROM stdin;
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
20250717082212
20250731150234
20250804100000
20250901200500
20250903112500
20250904133000
20250925093508
20251007112900
20251104100000
20251111201300
20251201000000
20260115000000
20260121000000
20260219120000
20260302000000
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.webauthn_challenges (id, user_id, challenge_type, session_data, created_at, expires_at) FROM stdin;
\.


--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.webauthn_credentials (id, user_id, credential_id, public_key, attestation_type, aaguid, sign_count, transports, backup_eligible, backed_up, friendly_name, created_at, updated_at, last_used_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: -
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 428, true);


--
-- PostgreSQL database dump complete
--

\unrestrict Fb15W0rHddN0AGh0YsmPFUxwUPF82AyUHi8XdRaxZVpA6W6wQ9EIfgP2F5XhLBT

