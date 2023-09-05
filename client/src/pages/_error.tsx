import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { serviceSideProps } from '@/utils/i18n';
import { useGlobalStore } from '@/store/global';
import { addLog } from '@/service/utils/tools';
import { getErrText } from '@/utils/tools';

function Error() {
  const router = useRouter();
  const { lastRoute } = useGlobalStore();

  useEffect(() => {
    setTimeout(() => {
      window.umami?.track('pageError', {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        appName: navigator.appName,
        lastRoute,
        route: router.asPath
      });
    }, 1000);

    setTimeout(() => {
      router.back();
    }, 2000);
  }, []);

  return (
    <p>
      Some systems are not compatible, causing the page to crash. If possible, please contact the
      author and give feedback on specific operations and pages. Mostly from Apple The safari
      browser causes it, you can try to replace the chrome browser.
    </p>
  );
}

export async function getServerSideProps(context: any) {
  console.log('[render error]: ', context);

  addLog.error(getErrText(context?.res));

  return {
    props: { ...(await serviceSideProps(context)) }
  };
}

export default Error;
