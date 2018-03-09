import * as React from 'react'
import { IGitHubUser } from '../../lib/databases'
import { Commit } from '../../models/commit'
import { ICompareState, CompareType } from '../../lib/app-state'
import { CommitList } from './commit-list'
import { Repository } from '../../models/repository'
import { Branch } from '../../models/branch'
import { ButtonGroup } from '../lib/button-group'
import { Button } from '../lib/button'
import {
  IAutocompletionProvider,
  BranchAutocompletionProvider,
  AutocompletingInput,
} from '../autocompletion'
import { Dispatcher } from '../../lib/dispatcher/index'

interface ICompareSidebarProps {
  readonly repository: Repository
  readonly gitHubUsers: Map<string, IGitHubUser>
  readonly state: ICompareState
  readonly branches: ReadonlyArray<Branch>
  readonly emoji: Map<string, string>
  readonly commitLookup: Map<string, Commit>
  readonly localCommitSHAs: ReadonlyArray<string>
  readonly dispatcher: Dispatcher
  readonly onRevertCommit: (commit: Commit) => void
  readonly onViewCommitOnGitHub: (sha: string) => void
}

interface ICompareSidebarState {
  readonly textInputValue: string | null
}

export class CompareSidebar extends React.Component<
  ICompareSidebarProps,
  ICompareSidebarState
> {
  private autocompletionProviders: ReadonlyArray<IAutocompletionProvider<any>>

  public constructor(props: ICompareSidebarProps) {
    super(props)

    this.autocompletionProviders = [
      new BranchAutocompletionProvider(this.props.branches),
    ]

    this.state = {
      textInputValue: null,
    }
  }

  public componentWillMount() {
    this.props.dispatcher.loadCompareState(
      this.props.repository,
      null,
      CompareType.Default
    )
  }

  public render() {
    return (
      <div id="compare">
        {this.renderAutoCompleteTextBox()}
        {this.renderButtonGroup()}
        <CommitList
          gitHubRepository={this.props.repository.gitHubRepository}
          commitLookup={this.props.commitLookup}
          commitSHAs={this.props.state.commitSHAs}
          selectedSHA={this.props.state.selection.sha}
          gitHubUsers={this.props.gitHubUsers}
          localCommitSHAs={this.props.localCommitSHAs}
          emoji={this.props.emoji}
          onViewCommitOnGitHub={this.props.onViewCommitOnGitHub}
          onRevertCommit={this.props.onRevertCommit}
          onCommitSelected={this.onCommitSelected}
          onScroll={this.onScroll}
        />
      </div>
    )
  }

  private renderButtonGroup() {
    return (
      <ButtonGroup>
        <Button>{`Behind (${this.props.state.behind})`}</Button>
        <Button>{`Ahead (${this.props.state.ahead})`}</Button>
      </ButtonGroup>
    )
  }

  private renderAutoCompleteTextBox() {
    return (
      <AutocompletingInput
        value={this.state.textInputValue || ''}
        placeholder="Enter branch name..."
        onValueChanged={this.onTextBoxValueChanged}
        autocompletionProviders={this.autocompletionProviders}
      />
    )
  }

  private onTextBoxValueChanged = (value: string) => {
    this.setState({ textInputValue: value })
  }

  private onCommitSelected = (commit: Commit) => {}

  private onScroll = (start: number, end: number) => {}
}