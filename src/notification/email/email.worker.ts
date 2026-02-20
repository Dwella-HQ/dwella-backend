import { MailerService } from '@nestjs-modules/mailer';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { JOB_NAMES } from 'src/utils/constants';

@Processor(JOB_NAMES.EMAIL_NOTIFICATION)
export class EmailWorker extends WorkerHost {
  logger = new Logger(EmailWorker.name);
  constructor(private mailerService: MailerService) {
    super();
  }

  async process(job: Job) {
    switch (job.name) {
      case 'send-email': {
        const { to, subject, template, context } = job.data as {
          to: string;
          subject: string;
          template: string;
          context: Record<string, any>;
        };
        try {
          await this.mailerService.sendMail({
            to,
            subject,
            template,
            context,
          });
          this.logger.log(`Email sent to ${to} with subject: ${subject}`);
        } catch (error) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          this.logger.error(`Failed to send email to ${to}: ${error.message}`);
          throw error;
        }
        return `Email job completed for ${to}`;
      }
      default: {
        throw new Error(`Unknown job name: ${job.name}`);
      }
    }
  }
}
