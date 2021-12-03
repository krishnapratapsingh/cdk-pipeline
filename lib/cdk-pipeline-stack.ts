import 'source-map-support/register';
import { Construct, Stack, StackProps } from '@aws-cdk/core';
import { Artifact } from '@aws-cdk/aws-codepipeline';
import { BitBucketSourceAction } from '@aws-cdk/aws-codepipeline-actions';
import { CdkPipeline, SimpleSynthAction } from '@aws-cdk/pipelines';
import { StringParameter } from '@aws-cdk/aws-ssm';
import { name, description as desc } from '../package.json';
import { gitHubConnectionArnParameterStorePath, GIT_BRANCH } from './comman/constants';
import { CdkchildpipelineRelease } from './cdk-pipeline-stack-release'

export const service = name;
export const description = desc;

/**
 * The stack that defines the core CDK pipeline
 */
export class CdkPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

   // const gitHubConnectionArn = StringParameter.valueForStringParameter(this, gitHubConnectionArnParameterStorePath);

    const repoSourceArtifact = new Artifact('SourceArtifact');
    const sourceArtifact = new Artifact('SourceArtifact');
    const cloudAssemblyArtifact = new Artifact('CloudFormationPrepareOutput');

    const corePipeline = new CdkPipeline(this, 'CdkCorePipeline', {
      pipelineName: service,
      cloudAssemblyArtifact,

      // Where the source can be found
      sourceAction: new BitBucketSourceAction({
        actionName: 'Checkout',
        owner: 'krishnapratapsingh',
        repo: 'cdk-pipeline',
        branch: GIT_BRANCH,
        //connectionArn: "arn:aws:codestar-connections:us-east-1:637791486797:connection/74a184e0-e9c0-46a3-bba4-f25d5b0c27e2",//gitHubConnectionArn,
        connectionArn: "arn:aws:codestar-connections:us-east-1:174020875537:connection/7f7328c2-6e15-4599-a586-ea6acb9260ee",//gitHubConnectionArn,
        output: repoSourceArtifact,
      }),

      // How it will be built and synthesized
      synthAction: SimpleSynthAction.standardNpmSynth({
        sourceArtifact,
        cloudAssemblyArtifact,
        installCommand: 'npm install --production=false',
        environment: {
          privileged: true,
        },
      }),
    });
        // This is where we add the application stages
    const deploy = new CdkchildpipelineRelease(this, 'CdkDeploy-Child-pipeline');
    corePipeline.addApplicationStage(deploy);
}
}
