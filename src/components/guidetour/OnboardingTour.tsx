import React, { useMemo } from 'react';
import Joyride, { Step, CallBackProps, STATUS } from 'react-joyride';

interface OnboardingTourProps {
    run: boolean;
    steps: Step[];
    onFinish: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
                                                                  run,
                                                                  steps,
                                                                  onFinish,
                                                              }) => {
    // Locale tiếng Việt
    const locale = useMemo(() => ({
        back: 'Quay lại',
        close: 'Đóng',
        last: 'Hoàn thành',
        next: 'Tiếp theo',
        skip: 'Bỏ qua',
    }), []);

    const handleJoyrideCallback = (data: CallBackProps) => {
        const { status } = data;
        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
            onFinish();
        }
    };

    return (
        <Joyride
            steps={steps}
            run={run}
            continuous
            showProgress={false}
            showSkipButton
            scrollToFirstStep
            callback={handleJoyrideCallback}
            locale={locale}
            styles={{
                options: {
                    primaryColor: '#4f46e5',
                    zIndex: 10000,
                    backgroundColor: '#ffffff',
                    textColor: '#1e293b',
                    arrowColor: '#ffffff',
                },
                tooltip: {
                    borderRadius: '12px',
                    padding: '12px',
                },
                tooltipTitle: {
                    fontWeight: 800,
                    fontSize: '16px',
                    color: '#4f46e5',
                    marginBottom: '8px',
                    textAlign: 'left',
                },
                tooltipContent: {
                    padding: '0',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    textAlign: 'left',
                },
                buttonNext: {
                    borderRadius: '8px',
                    fontWeight: 700,
                    padding: '8px 16px',
                    fontSize: '13px',
                    backgroundColor: '#4f46e5',
                },
                buttonBack: {
                    marginRight: '12px',
                    color: '#64748b',
                    fontSize: '13px',
                    fontWeight: 600,
                },
                buttonSkip: {
                    color: '#94a3b8',
                    fontSize: '13px',
                },
            }}
        />
    );
};