'use client';

import { motion } from 'framer-motion';
import { UserPlus, Brain, Rocket, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/app-store';
import { useI18n } from '@/lib/i18n';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: 'easeOut' },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const steps = [
  { icon: UserPlus, titleKey: 'landing.step1.title', descKey: 'landing.step1.desc', step: 1 },
  { icon: Brain, titleKey: 'landing.step2.title', descKey: 'landing.step2.desc', step: 2 },
  { icon: Rocket, titleKey: 'landing.step3.title', descKey: 'landing.step3.desc', step: 3 },
] as const;

const stats = [
  { valueKey: 'landing.about.stat1', labelKey: 'landing.about.stat1Label' },
  { valueKey: 'landing.about.stat2', labelKey: 'landing.about.stat2Label' },
  { valueKey: 'landing.about.stat3', labelKey: 'landing.about.stat3Label' },
  { valueKey: 'landing.about.stat4', labelKey: 'landing.about.stat4Label' },
] as const;

export default function LandingPage() {
  const { setAuthModalOpen, setAuthModalMode } = useAppStore();
  const { t } = useI18n();

  const handleRegister = () => {
    setAuthModalMode('register');
    setAuthModalOpen(true);
  };

  const handleLogin = () => {
    setAuthModalMode('login');
    setAuthModalOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-400">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-emerald-700/30 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-5 pb-20 pt-28 sm:px-8 sm:pt-36 sm:pb-28 md:pt-44 md:pb-32">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex flex-col items-center text-center"
          >
            <motion.h1
              variants={fadeUp}
              custom={0}
              className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl"
            >
              {t('landing.hero.title')}{' '}
              <span className="bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent">
                {t('landing.hero.highlight')}
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={1}
              className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-emerald-50/90 sm:mt-6 sm:text-lg md:text-xl"
            >
              {t('landing.hero.subtitle')}
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={2}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4"
            >
              <Button
                size="lg"
                onClick={handleRegister}
                className="h-11 min-h-[44px] rounded-full bg-white px-7 text-base font-semibold text-emerald-700 shadow-lg shadow-emerald-900/20 hover:bg-emerald-50 hover:text-emerald-800 sm:h-12 sm:px-8 sm:text-lg"
              >
                {t('landing.hero.cta')}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleLogin}
                className="h-11 min-h-[44px] rounded-full border-white/40 bg-white/10 px-7 text-base font-semibold text-white backdrop-blur-sm hover:bg-white/20 hover:text-white sm:h-12 sm:px-8 sm:text-lg"
              >
                {t('landing.hero.loginCta')}
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
            preserveAspectRatio="none"
          >
            <path
              d="M0 60V30C240 0 480 0 720 30C960 60 1200 60 1440 30V60H0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="bg-white py-16 sm:py-20 md:py-24">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeUp}
            custom={0}
            className="text-center text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl md:text-4xl"
          >
            {t('landing.howItWorks')}
          </motion.h2>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={staggerContainer}
            className="mt-12 grid gap-6 sm:mt-14 sm:grid-cols-3 sm:gap-8"
          >
            {steps.map(({ icon: Icon, titleKey, descKey, step }) => (
              <motion.div key={step} variants={fadeUp} custom={step - 1}>
                <Card className="group relative overflow-hidden rounded-2xl border-gray-100 bg-white py-8 shadow-none transition-shadow duration-300 hover:shadow-lg hover:shadow-emerald-100/60 sm:py-10">
                  {/* Step number badge */}
                  <span className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-600">
                    {step}
                  </span>

                  <CardContent className="flex flex-col items-center px-6 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition-colors duration-300 group-hover:bg-emerald-600 group-hover:text-white">
                      <Icon className="h-7 w-7" strokeWidth={1.8} />
                    </div>

                    <h3 className="mt-5 text-lg font-semibold text-gray-900">
                      {t(titleKey)}
                    </h3>

                    <p className="mt-2 text-sm leading-relaxed text-gray-500">
                      {t(descKey)}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── About / Stats ─── */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-16 sm:py-20 md:py-24">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
            className="text-center"
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl md:text-4xl"
            >
              {t('landing.about.title')}
            </motion.h2>

            <motion.p
              variants={fadeUp}
              custom={1}
              className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-gray-500 sm:text-lg"
            >
              {t('landing.about.desc')}
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={staggerContainer}
            className="mt-12 grid grid-cols-2 gap-4 sm:mt-14 sm:gap-6 md:grid-cols-4 md:gap-8"
          >
            {stats.map(({ valueKey, labelKey }, i) => (
              <motion.div
                key={valueKey}
                variants={fadeUp}
                custom={i}
              >
                <Card className="rounded-2xl border-gray-100 bg-white py-6 text-center shadow-none transition-shadow duration-300 hover:shadow-md hover:shadow-emerald-100/50 sm:py-8">
                  <CardContent className="px-4 sm:px-6">
                    <p className="text-3xl font-extrabold tracking-tight text-emerald-600 sm:text-4xl md:text-5xl">
                      {t(valueKey)}
                    </p>
                    <p className="mt-2 text-xs font-medium text-gray-500 sm:text-sm">
                      {t(labelKey)}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="mt-auto border-t border-gray-100 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-5 py-8 sm:flex-row sm:justify-between sm:px-8 sm:py-6">
          {/* Logo & Copyright */}
          <div className="flex flex-col items-center gap-1 sm:items-start">
            <span className="text-xl font-bold tracking-tight text-emerald-700">
              {t('common.appName')}
            </span>
            <p className="text-xs text-gray-400">
              &copy; {new Date().getFullYear()} {t('common.appSubtitle')}. {t('landing.footer.rights')}
            </p>
          </div>

          {/* DMW License Badge */}
          <Badge
            variant="outline"
            className="flex min-h-[44px] items-center gap-1.5 rounded-full border-emerald-200 bg-emerald-50/60 px-4 py-2 text-xs font-medium text-emerald-700"
          >
            <ShieldCheck className="h-4 w-4" />
            {t('landing.footer.dmw')}
          </Badge>
        </div>
      </footer>
    </div>
  );
}