import { useEffect, useRef } from 'react';
import { driver, Driver, DriveStep } from "driver.js";
import "driver.js/dist/driver.css";

interface OnboardingTourProps {
    run: boolean;
    steps: any[];
    onFinish: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
                                                                  run,
                                                                  steps,
                                                                  onFinish,
                                                              }) => {
    const driverObj = useRef<Driver | null>(null);

    useEffect(() => {
        driverObj.current = driver({
            showProgress: false,
            allowClose: true,
            overlayColor: 'rgba(0, 0, 0, 0.75)',
            nextBtnText: 'Tiếp theo',
            prevBtnText: 'Quay lại',
            doneBtnText: 'Hoàn thành',
            onDestroyStarted: () => {
                onFinish();
                driverObj.current?.destroy();
            },
            stageRadius: 12,
        });
    }, [onFinish]);

    useEffect(() => {
        if (run && driverObj.current) {
            // Định nghĩa các giá trị hợp lệ cho side
            const validSides = ["top", "bottom", "left", "right"];

            const driverSteps: DriveStep[] = steps.map(step => {
                // Xử lý placement từ Joyride sang Driver side
                const rawSide = step.placement?.split('-')[0];
                const sideValue = validSides.includes(rawSide) ? rawSide : "bottom";

                return {
                    element: step.target === 'body' ? undefined : step.target,
                    popover: {
                        title: step.title,
                        description: step.content,
                        // Ép kiểu (as any) hoặc (as "top" | ...) để thỏa mãn DriveStep
                        side: sideValue as "top" | "bottom" | "left" | "right",
                        align: 'start' as "start" | "center" | "end"
                    }
                };
            });

            driverObj.current.setSteps(driverSteps);
            driverObj.current.drive();
        }
    }, [run, steps]);

    return null;
};