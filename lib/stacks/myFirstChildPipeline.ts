import 'source-map-support/register';
import {  Stack, StackProps, Construct, CfnOutput } from '@aws-cdk/core';
import { Artifact, Pipeline } from '@aws-cdk/aws-codepipeline';
import { BitBucketSourceAction, CodeBuildAction, S3DeployAction } from '@aws-cdk/aws-codepipeline-actions';
import { Project } from '@aws-cdk/aws-codebuild';
import { Bucket } from '@aws-cdk/aws-s3';
import {
  GIT_BRANCH,
} from '../comman/constants';

export class FirstCftPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const repoSourceArtifact = new Artifact('SourceArtifact');
    const cloudFormationArtifact = new Artifact('CloudFormationPrepareOutput');

    const sourceBucket = new Bucket( this, 'SourceBucket1286');
    const deployBucket = new Bucket(this, 'DeployBucket1286');
    const deployInput = new Artifact('S3deploy');
    const GitHubAction = new BitBucketSourceAction({
      actionName: 'Checkout',
      owner: 'krishnapratapsingh',
      repo: 'cdk-firstchild',
      branch: GIT_BRANCH,
      connectionArn: 'arn:aws:codestar-connections:us-east-1:174020875537:connection/7f7328c2-6e15-4599-a586-ea6acb9260ee',
      output: repoSourceArtifact,
    });

    const pipeline = new Pipeline(this, 'MyFirstChildPipeline', {
      pipelineName: 'MyFirstChildPipeline',
      restartExecutionOnUpdate: true,
      artifactBucket: sourceBucket,
      stages: [
        {
          stageName: 'SourceCodeDownload',
          actions: [
            GitHubAction,
          ],
        },
		{
		 stageName: 'Deploy',
		 actions: [
		 new S3DeployAction({
          actionName: 'S3Deploy',
          bucket: deployBucket,
          input: repoSourceArtifact,
          runOrder: 1,
        }),
		 ],
		},
      ],
    });

    new CfnOutput(this, 'PipelineArn: ', {
      value: pipeline.pipelineArn ?? 'Something went wrong with the deploy',
    });
  }
}

