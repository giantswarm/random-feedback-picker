import React, { Component } from 'react';
import './App.css';
import TeamMembers from './team';
import _ from 'underscore';
import { shuffle } from 'shuffle-seed';

// var seed = "SEEDYOL";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      seed: window.location.href.split('#')[1],
      working: false
    };
  }

  assignMembers(allMembers, seed) {
    _.map(_.groupBy(allMembers, "team"), ((teamMembers, teamName) => {
      _.each(teamMembers, (member, i) => {
        member.firstAssignment = shuffle(teamMembers, seed)[teamMembers.indexOf(member)];
        member.secondAssignment = shuffle(allMembers, seed)[allMembers.indexOf(member)];
      });
    }))

    return allMembers;
  }

  // Determines if the result of assignMembers is a valid distribution.
  // (i.e.
  //    nobody is set to give feedback on themselves
  //    nobody is set to give feedback on a team-member for the second assignment
  //  )
  isValidOutcome(allMembers) {
    var invalidMember = _.find(allMembers, (member) => {
      return member.firstAssignment === member ||
             member.firstAssignment.team !== member.team ||
             member.secondAssignment.team === member.team
    });

    return !invalidMember;
  }

  randomCode() {
    return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
  }

  generateValidSeed() {
    this.setState({
      working: true
    }, () => {
      setTimeout(() => {
        var seed = this.randomCode();
        var valid = false
        while (!valid) {
          seed = this.randomCode();
          valid = this.isValidOutcome(this.assignMembers(TeamMembers, seed))
        }

        window.location.hash = seed;

        this.setState({
          valid: true,
          working: false,
          seed: seed
        });
      }, 20)
    });
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <div>
            <h1 className="App-title">Giant Swarm Feedback Picker</h1>
            <p>
              This app helps us determine who we will give feedback to in the Quarterly Peer Review.
            </p>

            <p>
              Press the big green button to make a possible solution. Might take a little while.
            </p>
          </div>

          <div>
            {
              this.state.working ?
              <img src="img/loader.svg" className="loader" height="50px" width="88px" style={{display: "block"}}/>
              :
              <button onClick={this.generateValidSeed.bind(this)}>
              {
                typeof this.state.seed !== "undefined" ?
                "GO AGAIN"
                :
                "GO"
              }
              </button>
            }

            <div className="seed-explanation">
              Seed: {this.state.seed}<br/>
            </div>
          </div>
        </header>
        <div className="teams">
          {
            _.map(_.groupBy(this.assignMembers(TeamMembers, this.state.seed), "team"), ((members, teamName) => {
              return <div className="team" key={teamName}>
                <h2>{teamName}</h2>

                {_.map(members, (member) => {
                  return <div className="member" key={member.name}>
                    <img src={"img/team/" +member.name + ".jpg"} alt={member.name} />
                    <h3>{member.name}</h3>

                    <div className="feedback-assignments">
                      {
                        typeof this.state.seed === "undefined" ?
                        ""
                        :
                        <div>
                          <img src={"img/team/" + member.firstAssignment.name +".jpg"} alt="o" />
                          <img src={"img/team/" + member.secondAssignment.name + ".jpg"} alt="o" />
                        </div>
                      }
                    </div>
                  </div>
                })}
              </div>
            }))
          }
        </div>
      </div>
    );
  }
}

export default App;
