import { motion } from "motion/react";
import MeterStatusIndicator from "#/components/custom/common/MeterStatusIndicator";
import type { MeterThreshold } from "#/types/meter";

type HomePageMeter = {
	id: string;
	current: number | undefined;
	goodThreshold: MeterThreshold;
	badThreshold: MeterThreshold;
	name: string;
	unit: string;
};

type HomePageMetersDisplayProps = {
	title: string;
	value: HomePageMeter[];
};

const HomePageMetersDisplay = ({
	title,
	value,
}: HomePageMetersDisplayProps) => {
	return (
		<motion.div
			className="flex flex-col gap-3 p-4 rounded-lg bg-muted"
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
		>
			<h2 className="text-2xl font-semibold">{title}</h2>

			<div className="grid grid-cols-6 gap-4">
				{value.map((meter, index) => (
					<motion.div
						key={meter.id}
						layout
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{
							duration: 0.25,
							delay: index * 0.05,
						}}
					>
						<MeterStatusIndicator
							value={meter.current}
							goodThreshold={meter.goodThreshold}
							badThreshold={meter.badThreshold}
							name={meter.name}
							unit={meter.unit}
						/>
					</motion.div>
				))}
			</div>
		</motion.div>
	);
};

export default HomePageMetersDisplay;
